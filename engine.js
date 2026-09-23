/* DepositProof engine - pure move-out evidence + deposit deadline math, shared by app.html and node tests. */
(function(root, factory){
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DepositProofEngine = factory();
})(typeof self !== 'undefined' ? self : this, function(){

  var DAY = 86400000;

  var DEFAULT_ROOMS = ['Kitchen', 'Bathroom', 'Bedroom', 'Living room', 'Walls & floors', 'Appliances', 'Keys & remotes'];

  function returnDeadlineMs(moveOutMs, jurisdictionDays){
    return moveOutMs + jurisdictionDays * DAY;
  }

  /* whole days until deadline; negative when landlord is late */
  function daysLeft(nowMs, deadlineMs){
    return Math.ceil((deadlineMs - nowMs) / DAY);
  }

  /* deadline urgency: safe (>=7d) | closing (<7d) | late (past) */
  function urgency(nowMs, deadlineMs){
    var d = daysLeft(nowMs, deadlineMs);
    if (d < 0) return {key:'late', label:'landlord is late', days:d};
    if (d < 7) return {key:'closing', label:'deadline closing', days:d};
    return {key:'safe', label:'on the clock', days:d};
  }

  function completion(rooms){
    var done = rooms.filter(function(r){ return r.note && r.note.trim(); }).length;
    return {done:done, total:rooms.length, pct: rooms.length ? Math.round(done / rooms.length * 100) : 0};
  }

  function fmtDate(ms){
    return new Date(ms).toLocaleDateString('en-US', {weekday:'short', month:'short', day:'numeric', year:'numeric'});
  }

  /* landlord-ready condition report */
  function report(tenant, address, moveOutMs, jurisdictionDays, rooms, loggedMs){
    var lines = [];
    lines.push('MOVE-OUT CONDITION REPORT');
    lines.push('Tenant: ' + tenant);
    lines.push('Property: ' + address);
    lines.push('Move-out date: ' + fmtDate(moveOutMs));
    lines.push('Deposit return deadline: ' + fmtDate(returnDeadlineMs(moveOutMs, jurisdictionDays)) + ' (' + jurisdictionDays + ' days after move-out)');
    lines.push('Report generated: ' + fmtDate(loggedMs));
    lines.push('');
    rooms.forEach(function(r){
      var note = r.note && r.note.trim() ? r.note.trim() : '(no condition logged)';
      lines.push(r.name.toUpperCase() + ' - ' + r.status.toUpperCase());
      lines.push('  ' + note);
      if (r.loggedMs) lines.push('  Logged: ' + fmtDate(r.loggedMs));
    });
    lines.push('');
    lines.push('This report was created contemporaneously with move-out. Photos on file.');
    return lines.join('\n');
  }

  return {DAY:DAY, DEFAULT_ROOMS:DEFAULT_ROOMS, returnDeadlineMs:returnDeadlineMs, daysLeft:daysLeft, urgency:urgency, completion:completion, fmtDate:fmtDate, report:report};
});
