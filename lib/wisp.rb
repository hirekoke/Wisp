require "sinatra"
require "sinatra-websocket"
require "json"
require "rbconfig"

class Wisp < Sinatra::Base
  DIR = File.join(File.dirname(File.dirname(__FILE__)), "public")
  set :public_folder, DIR

  get "/" do
    if !request.websocket?
      send_file File.join(DIR, "index.html")
    else
      request.websocket do |ws|
        ws.onopen    { Wisp.onopen(ws)    }
        ws.onclose   { Wisp.onclose(ws)   }
        ws.onmessage { Wisp.onmessage(ws) }
      end
    end
  end
  
  Session = Struct.new(:req, :ack, :file_sent, :prev_file, :prev_lineno, :prev_thread)

  @@sessions = {}
  @@mutex = Mutex.new
  
  def Wisp.onopen(ws)
    @@sessions[ws] = Session[0, 0, {}, nil, nil]
  end

  def Wisp.onclose(ws)
    @@sessions.delete(ws)
  end

  def Wisp.onmessage(ws)
    s = @@sessions[ws]
    s.ack = s.req
  end

  def Wisp.trace(event, file, lineno, method, binding, klass)
    return if event != "line"
    return if file.start_with?(RbConfig::TOPDIR)
    return if file == __FILE__
    return if !File.readable?(file)
    @@mutex.synchronize do
      thread = Thread.current.object_id.to_i
      @@sessions.each do |ws, s|
        if s.prev_thread != thread
          s.prev_thread = thread
          EM.next_tick { ws.send("T%x" % thread) }
        end
        if s.prev_file != file
          s.prev_file = file
          v = { "name" => file }
          unless s.file_sent[file]
            s.file_sent[file] = true
            v["code"] = File.foreach(file).map {|l| l.chomp }
          end
          v = JSON.dump(v)
          EM.next_tick { ws.send("F" + v) }
          s.prev_lineno = nil
        end
        if s.prev_lineno != lineno
          s.prev_lineno = lineno
          s.req += 1
          EM.next_tick { ws.send("L#{ lineno }") }
        end
      end
      sleep 0.1 until @@sessions.all? {|ws, s| s.ack >= s.req }
    end
  end

  def Wisp.output(s)
    EM.next_tick { @@sessions.each_key {|ws| ws.send("O#{ s }") } }
  end
  
  def Wisp.error(s)
    EM.next_tick { @@sessions.each_key {|ws| ws.send("E#{ s }") } }
  end

  def Wisp.wait
    sleep 0.1 while @@sessions.empty?
  end
end

Thread.new do
  Wisp.run!
  exit
end
Wisp.wait

class << $stdout
  alias write_org write

  def write(s)
    @buff ||= ""
    @buff << s
    while idx = @buff.index("\n")
      Wisp.output(@buff.slice!(0, idx + 1).chomp)
    end
    write_org(s)
  end
end

class << $stderr
  alias write_org write

  def write(s)
    @buff ||= ""
    @buff << s
    while idx = @buff.index("\n")
      Wisp.error(@buff.slice!(0, idx + 1).chomp)
    end
    write_org(s)
  end
end

at_exit {
  if $! != nil then
    Wisp.error($!.to_s)
    Wisp.error($!.backtrace.join("\n"))
  end
}

set_trace_func(proc do |event, file, lineno, method, binding, klass|
  Wisp.trace(event, file, lineno, method, binding, klass)
end)
