require_relative "thread2.rb"

ti = 0
loop do
  t1 = Thread.new do
    foo(ti, 3)
  end
  ti += 1
  t2 = Thread.new do
    bar(ti, 5)
  end
  ti += 1
  
  t1.join
  t2.join
end
