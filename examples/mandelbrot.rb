require 'complex'

def mandelbrot(c)
  i, z = 0, c
  while i < 20
    i, z = i + 1, z * z + c
    return i if z.abs > 2
  end
  i
end


(-12..12).each do |y|
  (-34..20).each do |x|
    putc ".-:;+=*@%$#"[mandelbrot(Complex(x / 20.0, y / 10.0)) / 2]
  end
  puts
end

