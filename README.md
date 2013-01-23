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

How to configure huboard
-------------------------
* * * 

Huboard now provides the ability to override some global default
settings with labels

```
    defaults = {
       :show_all => true #=> show all open issues, including issues with no labels
    }


```

To override add labels to your repository with the following patterm

>    @huboard: `yaml`

Example:

>    @huboard: :show_all: false

See issue [#89](https://github.com/rauhryan/huboard/issues/89)


How to link repositories together
--------------------------
* * *

Add labels to your repository with the following pattern

>  Link <=> username/repo

Example:

> Link <=> rauhryan/ghee

For help distiguishing cards add a custom color to label and huboard
will add a border to issues belonging to the linked board

Note:
    linked boards will aggregate milestone and label together.
Milestones are aggregated by the title and **must** be exactly the
same in order to work. Labels are aggregated by the label's name the
labels **name and color** must match in order to work.


# To run locally

### Install dependencies

    gem install bundler
    bundle install

### Register app for Github OAuth

Go to https://github.com/settings/applications and register your
application to get the application keys needed for OAuth.

- URL: Pow: `http://huboard.dev`, Rack: `http://localhost:9292`
- Callback: Pow: `http://huboard.dev/auth/github/callback`, Rack:
  `http://localhost:9292/auth/github/callback`

### Configure your app

    cp .settings.sample .settings

Edit `.settings` to set the Client ID and Client Secret provided by
Github when you registered the application.

## Using Pow

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


### Try the app

Open your browser to http://huboard.dev/board

## Using rack (shotgun, thin, ect.)

`bundle exec shotgun -p 9292`

or

`bundle exec rackup config.ru`


## Deploy to Heroku

# Please use the latest stable tag if you are hosting your own instance of huboard.

[huboard.com](http://huboard.com) is fully operational and free. If you feel the need to host your own instance
please use the latest stable tag. The master branch doesn't always reflect the deployed version on huboard.com and
very difficult to support and troubleshoot if you run into any issues.

[Sign up](https://api.heroku.com/signup) on [Heroku](http://www.heroku.com/) if you don't have an account, and install the heroku gem:

```
[sudo] gem install heroku
```

### 1. Create the Heroku App

##### Clone Huboard:

```
git clone https://github.com/rauhryan/huboard.git
cd huboard
```

##### Bundle:

```
bundle install
```

##### Create the app:

```
heroku app:create ---stack cedar
```

or, if you'd prefer to name your app yourself:

```
heroku app:create <your-app-name> --stack cedar
```


### 2. Register app for Github OAuth

Go to https://github.com/account/applications and register your
application to get the application keys needed for OAuth.

- URL: `http://<your-app-name>.herokuapp.com`
- Callback: `http://<your-app-name>.herokuapp.com/auth/github/callback`



### 4. Configure Heroku Environment

Now you'll need to setup some environment variables on Heroku. 

Customize your values and run the following from your project root:

```
heroku config:add \
  GITHUB_CLIENT_ID='<your-github-oauth-client>' \
  GITHUB_SECRET='<your-github-oauth-secret>' \
  SECRET_KEY='<your-random-secret-key>' \
  SESSION_SECRET='<your-complex-session-secret>' \
  TEAM_ID='<your-github-team-id>'
```

### 5. Deploy

```
git push heroku master
```

-------

The MIT License (MIT)
Copyright (c) 2012-2013 Ryan Rauh

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
