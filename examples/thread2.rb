def foo(t, max)
  i = 0
  max.times do
    puts "foo #{t}: #{i}"
    i += 1
  end
end

def bar(t, max)
  i = 0
  max.times do
    puts "bar #{t}: #{i}"
    i += 1
  end
end
