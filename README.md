#How to contribute

Before contributing to Huboard, please:

  1. Read and sign the [Contributor License Agreement](https://docs.google.com/forms/d/1hapbhON_AdtwVPgRFQqf5d600ayptoYcVfgcSQO0FQg/viewform)

Ways to contribute:

  * The easiest way you can contribute by simply using huboard and adding issues. Find bugs or think of cool features, let me know by submitting issues
  * Take a look at the open issues. Anything is fair game, pick one and send me a pull request.
  * I've added a label called `Please contribute`, these are features/defects that are lower priority but would still be a great addition to the product

# How To Set Up Your Repo

Add labels to your repository with the following pattern

>  # - Title

Where:

>  '#' == index of column

> 'Title' == column header

Example:

>  0 - Backlog

>  1 - Ready

>  2 - Working

>  3 - Done

The number represents the index of the column and the will be the column header

# How To Configure Huboard

Huboard now provides the ability to override some global default
settings with labels

    defaults = {
      :show_all => true # show all open issues, including issues with no labels
    }

To override add labels to your repository with the following patterm

>    @huboard: `yaml`

Example:

>    @huboard: :show_all: false

See issue [#89](https://github.com/rauhryan/huboard/issues/89)


# How To Link Repositories Together

Add labels to your repository with the following pattern

>  Link <=> username/repo

Example:

> Link <=> rauhryan/ghee

Reciprocal links must be present in any two repositories that are to
be linked together.

For help distiguishing cards add a custom color to label and huboard
will add a border to issues belonging to the linked board

Note:
    linked boards will aggregate milestone and label together.
Milestones are aggregated by the title and **must** be exactly the
same in order to work. Labels are aggregated by the label's name the
labels **name and color** must match in order to work.


# How To Run Locally

## Install Dependencies

    gem install bundler
    bundle install

Also install memcached and couch, e.g.

    apt-get install couchdb memcached

## Register App For Github OAuth

Go to https://github.com/settings/applications and register your
application to get the application keys needed for OAuth.

- URL: Pow: `http://huboard.dev`, Rack: `http://localhost:9292`
- Callback: Pow: `http://huboard.dev/`, Rack:
  `http://localhost:9292/`

## Configure Your App

    cp .env.sample .env

Edit `.env` to set the Client ID and Client Secret provided by
Github when you registered the application.

### Using Pow

Install Pow from [pow.cx](http://pow.cx)

Configure your app for pow:

    cd ~/.pow
    ln -s /path/to/huboard

Sinatra doesn't automatically reload changes to your app, so tell Pow to restart on every request:

    cd /path/to/huboard
    mkdir tmp
    touch tmp/always_restart.txt


### Foreman

`foreman start -f Procfile.dev`

# Developing Javascript locally

The new HuBoard UI is built using emberjs and using ember-tools to build the
UI's javascript files. In order to develop locally you will need to have
ember-tools watch the files and build it automatically

`cd ember`
`npm install ember-tools`
`ember build -w`

# Deploy To Heroku

**Please use the latest stable tag if you are hosting your own instance of huboard.**

# Warning - the deployment instructions are out of date.
# Huboard now requires memcached and couchdb. Please help me update the
# documentation


[huboard.com](http://huboard.com) is fully operational and free. If you feel the need to host your own instance
please use the latest stable tag. The master branch doesn't always reflect the deployed version on huboard.com and
very difficult to support and troubleshoot if you run into any issues.

[Sign up](https://api.heroku.com/signup) on [Heroku](http://www.heroku.com/) if you don't have an account, and install the [heroku toolbelt](https://toolbelt.heroku.com/)

## 1. Create The Heroku App

Clone Huboard:

    git clone https://github.com/rauhryan/huboard.git
    cd huboard

Bundle:

    bundle install

Create the app:

    heroku apps:create ---stack cedar

or, if you'd prefer to name your app yourself:

    heroku apps:create <your-app-name> --stack cedar

## 2. Register App For Github OAuth

Go to https://github.com/settings/applications and register your
application to get the application keys needed for OAuth.

- URL: `http://<your-app-name>.herokuapp.com`
- Callback: `http://<your-app-name>.herokuapp.com`

## 3. Configure Heroku Environment

Now you'll need to setup some environment variables on Heroku.

Customize your values and run the following from your project root:

    heroku config:add \
      GITHUB_CLIENT_ID='<your-github-oauth-client>' \
      GITHUB_SECRET='<your-github-oauth-secret>' \
      SECRET_KEY='<your-random-secret-key>' \
      SESSION_SECRET='<your-complex-session-secret>' 

## 4. Deploy

Note: I know this is crap, trust me I will fix it.

Before deploying there are a few step you need to do manually to prepare the assets for production.
Will will need node.js installed as well as the requirejs, uglify-js (v1.x) and lazy npm packages.

    npm install requirejs uglify-js@1 lazy

Predeployment (if you've changed any js or css files) run the following rake tasks in this exact order

    rake rjs
    rake js
    rake css

Commit the changes and

    git push heroku master




# License

The MIT License (MIT)
Copyright (c) 2012-2013 Ryan Rauh

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
