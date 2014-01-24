#errand-boy

Middleware-inspired JavaScript component for sequencing methods.

###description

Why rely on big-named frameworks to provide us with simple call/callback setups? Let **erands** call your methods, sequentially and on-time... 

###usage

Wait a second and then call a method:

    var errands = require('errands');

    errands().wait(1000).run(function(){

      console.log('now what?');

    });

Pass some arguments, and repeat previous methods:

    errands({errands:0}, {elapsed:0}).wait(1000).run(function(obj1, obj2){

      obj1.errands++;
      obj2.elapsed += 1000;

      console.log('errands: ' + obj1.errands + 'time: ' + obj2.elapsed);

    }).repeat(1);

Wait for methods to call the next errand:

    errands().wait(function(){

      console.log('waiting');

      setTimeout(this.next, 3000);

    }).run(function(){

      console.log('run');

    });