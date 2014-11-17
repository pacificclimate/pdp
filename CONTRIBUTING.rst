.. _contributors-guide:

Contributor's Guide
===================

.. _how-to-report-bugs:

How to report bugs
------------------

If you think that there is a problem or bug with the data portal, please let us know! We welcome bug reports, but ask that you follow a few guidelines when doing so. To report a bug:

- `Create a new issue`_ on our GitHub page.
- Tag/label the issue as a bug
- Leave it unassigned

Then please follow these guidelines for writing your report:

- Please describe in as much detail as possible
- Include a complete description of:

  - Exactly what you did (i.e. "steps to reproduce")
  - What you expected to happen?
  - What did happen?

- If you received an error message *cut and paste* the error message *exactly*. Do not report "there was an error". Do not paraphrase the error.
- Please include the time (and timezone) that this occurred. Sometimes we can get more information from the logs, but only if we have a time to reference.
- Include your IP address (`you can find it here`_). Again, this helps us find your requests in the logs.
- If you had a problem with the web user interface, feel free to include your browser version. That information is sometimes relevant (though less often than you might expect).

I cannot stress enough how important it is to contrast what you expected to happen, with what actually happened. When executing the code does not produce the *advertised* result, there is a bug in the system. When the code does not produce the result that you *wished* it had, this is *not* a bug. We receive far too many reports in the latter category.

Many people attempt to provide a diagnosis when reporting bugs in the hopes that it will be helpful. Please *refrain* from doing this, and stick to reporting known facts: what did you do and what did you observe. If you skip these important things and jump right to what could be an incorrect diagnosis, it is highly likely that you will delay the troubleshooting.

If you're *really* committed to writing a stellar bug report, look through the guidelines for `writing *effective* bug reports <http://www.chiark.greenend.org.uk/~sgtatham/bugs.html>`_.

.. _you can find it here: http://whatismyipaddress.com/

What happens next?
^^^^^^^^^^^^^^^^^^

This depends. If you've provided enough information that we can reproduce and verify your problem, then we will accept the bug, tag it with a priority and assign it to a developer on our team. Though we will do our best to prioritize this work, none of PCIC's funders support maintenance or bug fixes. So we will work on it as we are able.

If you have not provided enough information for us to confirm a bug, we may tag the issue "Needs Info" or "Invalid". Please don't take this personally. However, you can assume that we will not put any time against this ticket until you do more to convince us that it *is* actually a problem.

.. _Create a new issue: https://github.com/pacificclimate/pdp/issues/new


Don't code? No problem!
-----------------------

Even if you don't program for a living there are plenty of ways to help. Not only is the data portal code open and collaborative, but so is the documentation and issue tracking. Anyone can help with these. If you can't program, consider helping with the following:

- If the documentation doesn't answer your questions, it probably doesn't answer many people's questions. Help us all out and write something that does.
- Take a look through the outstanding `"help wanted" issues`_, and see if you know any of the answers.
- If there are `open bug reports`_, see if you can reproduce the problem and verify that it exists. Having bug reports validated and/or clarified by multiple parties is extremely valuable.
- Tell us your story. If the PCIC Data Portal has helped your research or project, we would love to hear about it. Write a blog post and/or `send us an e-mail`_.

.. _"help wanted" issues: https://github.com/pacificclimate/climdex.pcic/labels/help%20wanted
.. _open bug reports: https://github.com/pacificclimate/climdex.pcic/labels/bug
.. _send us an e-mail: mailto:hiebert@uvic.ca
