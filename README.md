# Wisp

Ruby extension library for visualizing the line that is currently running

## Installation

    $ gem install wisp

## How to build (for developers)

    $ rake build

## Example

    $ ruby -rwisp examples/loop.rb
    == Sinatra/1.3.2 has taken the stage on 4567 for development with backup from Thin
    >> Thin web server (v1.3.1 codename Triple Espresso)
    >> Maximum connections set to 1024
    >> Listening on 0.0.0.0:4567, CTRL+C to stop

And then open http://localhost:4567 in Google Chrome (recommended) or Firefox.
