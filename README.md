# Welcome to Huboard

How to set up YOUR repo
--------------------------
* * *

Add labels to your repository with the following pattern

>  # - Title

>  # == index of column
>  Title == column header

Example:

>  1 - Backlog

>  2 - Ready

>  3 - Working

>  4 - Done

The number represents the index of the column and the will be the column header

To move a card with a commit message add "push GH-#" anywhere in your commit message

Other supported key words

> push GH-#

> pushed GH-#

> move GH-#

> moves GH-#

* ~~Make sure you create a hook for the Repository on the home page. Only click the button once (known defect)~~
* Currently you can only move one card per commit message (will fix soon)

How to link repositories together
--------------------------
* * *

Add labels to your repository with the following pattern

>  Link <=> username/repo

Example:

> Link <=> rauhryan/ghee

For help distiguishing cards add a custom color to label and huboard
will add a border to issues belonging to the linked board

![linked board](http://f.cl.ly/items/13453x43053r2G0d3x0v/Screen%20Shot%202012-04-28%20at%2010.48.17%20AM.png)

Bugs
--------------------------
* * *

* ~~creates multiple post-receive hooks, only click once. You can manually delete the hook from the admin panel on github~~
* Milestones reordering takes a few seconds and I don't have a loading screen on there yet so give it a few seconds


Notes
--------------------------
* * *

* Milestones reordering will change the due date of your milestone. (currently the only way to order then)
* commit message that "push GH-#" past the last column close the issue

## To run locally

### Install Pow from [pow.cx](http://pow.cx)

Configure your app for pow:

    cd ~/.pow
    ln -s /path/to/huboard

Sinatra doesn't automatically reload changes to your app, so tell Pow to restart on every request:

    cd /path/to/huboard
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

- URL: `http://huboard.dev`
- Callback: `http://huboard.dev/auth/github/callback`

### Configure your app

    cp .settings.sample .settings

Edit `.settings` to set the Client ID and Client Secret provided by
Github when you registered the application.

### Try the app

Open your browser to http://huboard.dev/board

The MIT License (MIT)
Copyright (c) 2012 Ryan Rauh

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
