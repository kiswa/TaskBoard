hyperlink = function(item, trackers) {

  var s = item;
  
  var bugId = /%BUGID(?:\\(\d))?%/g;

  if (trackers === undefined) return s;

  for (i in trackers)
  {
    var tracker = trackers[i][0];
    var bug     = trackers[i][1];

    if ((tracker == "") || (bug == "")) continue;

    var bGroups = bugId.exec(tracker);
    var bugEx = new RegExp(bug);
    var regEx = new RegExp("(^|\\s|[^\\\\\\?\\/\\-\\[])(" + bug + ")(?=\\W|$)", "mg"); 
    //s = s.replace(regEx, "\$1[\$2]("+tracker.replace(bugId,"\$2")+")");
    s = s.replace(regEx, function(match,g1,g2,offset, text){
      
      
      var m = bugEx.exec(g2);
      var r = tracker.replace(bugId, function(match ,p1, offset, text) {
        var idx = 0;
        if (p1 !== undefined) idx = parseInt(p1);
        return m[idx];
      });
      return g1+"["+g2+"]("+r+")";
    });
  } 
  return s;
}
