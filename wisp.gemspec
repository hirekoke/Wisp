# -*- encoding: utf-8 -*-

Gem::Specification.new do |gem|
  gem.authors       = ["@hirekoke", "Yusuke Endoh"]
  gem.email         = ["XXX", "mame@tsg.ne.jp"]
  gem.description   = %q{XXX: Write a gem description}
  gem.summary       = %q{XXX: Write a gem summary}
  gem.homepage      = ""

  gem.files         = `git ls-files`.split($\)
  gem.executables   = gem.files.grep(%r{^bin/}).map{ |f| File.basename(f) }
  gem.test_files    = gem.files.grep(%r{^(test|spec|features)/})
  gem.name          = "wisp"
  gem.require_paths = ["lib"]
  gem.version       = "0.1.0"
end
