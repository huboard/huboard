# Inch Pebbles

## To run locally

### Install Pow from [pow.cx](http://pow.cx)

Configure your app for pow:

    cd ~/.pow
    ln -s /path/to/inch-pebbles

Sinatra doesn't automatically reload changes to your app, so tell Pow to restart on every request:

    cd /path/to/inch-pebbles
    mkdir tmp
    touch tmp/always_restart.txt

### Configure RVM

    cp .rvmrc.sample .rvmrc

Edit `.rvmrc` to specify your ruby version/gemset

Recommend MRI 1.9.2, to match the [bamboo stack on heroku](http://devcenter.heroku.com/articles/stack)

### Install dependencies

    gem install bundler -v 1.1.rc
    bundle install

### Register app for Github OAuth

Go to https://github.com/account/applications and register your
application to get the application keys needed for OAuth.

- URL: `http://inch-pebbles.dev`
- Callback: `http://inch-pebbles.dev/auth/github/callback`

### Configure your app

    cp .settings.sample .settings

Edit `.settings` to set the Client ID and Client Secret provided by
Github when you registered the application.

### Try the app

Open your browser to http://inch-pebbles.dev/board
