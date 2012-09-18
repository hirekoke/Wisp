# -*- encoding: utf-8 -*-

Gem::Specification.new do |gem|
  gem.authors       = ["hirekoke", "Yusuke Endoh"]
  gem.email         = ["hirekoke@yahoo.co.jp", "mame@tsg.ne.jp"]
  gem.description   = %q{Ruby extension library for visualizing the line that is currently running}
  gem.summary       = gem.description
  gem.homepage      = "https://github.com/hirekoke/Wisp"

  gem.files         = `git ls-files`.split($\)
  gem.executables   = gem.files.grep(%r{^bin/}).map{ |f| File.basename(f) }
  gem.test_files    = gem.files.grep(%r{^(test|spec|features)/})
  gem.name          = "wisp"
  gem.require_paths = ["lib"]
  gem.version       = "0.1.0"
end
