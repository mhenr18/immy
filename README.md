# This is a work in progress, don't use this yet!


(wanted a place to dump this link because it's really good at explaining how
Immutable is implemented and why it can be superior to Immy for some use cases)

Immutable.js (as of March 2016) uses a design inspired by this:
http://hypirion.com/musings/understanding-persistent-vector-pt-1

While this is "correct" in that you could easily implement this in C++ using all
const methods, it's not fast. Every change requires copying between 1 and 5
arrays of 32 elements.

It is better for workloads where you need to frequently use all of the lists
you generate, whereas Immy is more suited to workloads where you're only using
the most recent versions.
