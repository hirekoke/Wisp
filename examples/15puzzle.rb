require "sinatra"

def move(n)
  unless s = params[:b]
    s = "1234/5678/9abc/def0"
    10000.times { s.sub!(/([#{n = "%x" % (rand(15) + 1)}0])(.{4}|)([#{n}0])/) { $3+$2+$1 } }
  end
  s.sub!(/([#{n}0])(.{4}|)([#{n}0])/) { $3+$2+$1 }
  @b = s.scan(/\h+/).map do |l|
    "<tr>#{ l.scan(/\h/).map do |c|
      "<td>#{ c != ?0 ? "<a href='/#{ c }?b=#{ s }'>#{ c.hex }</a>" : "" }</td>"
    end.join }</tr>"
  end.join
  erb :index
end

Sinatra.new do
  enable :inline_templates
  get("/") { move("0") }

  get("/1") { move("1") }
  get("/2") { move("2") }
  get("/3") { move("3") }
  get("/4") { move("4") }
  get("/5") { move("5") }
  get("/6") { move("6") }
  get("/7") { move("7") }
  get("/8") { move("8") }
  get("/9") { move("9") }
  get("/a") { move("a") }
  get("/b") { move("b") }
  get("/c") { move("c") }
  get("/d") { move("d") }
  get("/e") { move("e") }
  get("/f") { move("f") }

end.run! port: 8000
sleep

__END__

@@ index
<html>
  <head>
    <title>15 puzzle</title>
    <style type="text/css">
      table { border-collapse: collapse; }
      td { width: 2em; text-align: right; border: 1px #000000 solid; }
      a { text-decoration: none; display: block; }
    </style>
  </head>
  <body>
    <table><%= @b %></table>
  </body>
</html>
