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

How to move cards with git commits
---------------------------
* * *

To move a card with a commit message add "push GH-#" anywhere in your commit message

Other supported key words

> push GH-#

> pushed GH-#

> move GH-#

> moves GH-#

* ~~Make sure you create a hook for the Repository on the home page. Only click the button once (known defect)~~
* Currently you can only move one card per commit message (will fix soon)


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

