/* Rejects throwaway (disposable) and hidden/relay email addresses on every sign-up form on gulcan-alo.com.
   Domain list: github.com/disposable-email-domains/disposable-email-domains (pinned version). */
(function () {
  var LIST = 'https://cdn.jsdelivr.net/gh/disposable-email-domains/disposable-email-domains@b5e699f5aa03ed0a0ba58462d5b5f037de408f4e/disposable_email_blocklist.conf';
  var EXTRA = ['laoia.com'];
  /* Email-hiding and relay services (forwarding aliases), matched with all their subdomains */
  var RELAY = ['privaterelay.appleid.com', 'mozmail.com', 'duck.com', 'simplelogin.com', 'simplelogin.co', 'simplelogin.fr', 'simplelogin.io', 'aleeas.com', 'slmails.com', 'silomails.com', 'slmail.me', 'anonaddy.com', 'anonaddy.me', 'addy.io', 'addymail.com', 'passmail.net', 'passmail.com', 'passinbox.com', '33mail.com', 'mailinator.com'];
  /* Apple Hide My Email aliases on icloud.com look like word-07-word */
  var HIDE_MY_EMAIL = [/^[a-z]+([._-])[0-9]{1,3}\1[a-z]+@icloud\.com$/];
  var MSG = 'Please use your real email address. Throwaway addresses and hidden or forwarding emails can\u2019t be used here.';
  var bad = null, loading = null;
  function load() {
    if (loading) return loading;
    loading = fetch(LIST).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
      bad = new Set(t.split('\n').map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean).concat(EXTRA));
    }).catch(function () { bad = new Set(EXTRA); });
    return loading;
  }
  function domainOf(v) { var i = v.lastIndexOf('@'); return i < 0 ? '' : v.slice(i + 1).trim().toLowerCase(); }
  function isRelay(v) {
    var d = domainOf(v), addr = v.trim().toLowerCase();
    for (var j = 0; j < RELAY.length; j++) { if (d === RELAY[j] || d.slice(-RELAY[j].length - 1) === '.' + RELAY[j]) return true; }
    for (var h = 0; h < HIDE_MY_EMAIL.length; h++) { if (HIDE_MY_EMAIL[h].test(addr)) return true; }
    return false;
  }
  function isBad(d) {
    if (!d) return false;
    if (!bad) return EXTRA.indexOf(d) >= 0;
    if (bad.has(d)) return true;
    var p = d.split('.');
    for (var k = 1; k < p.length - 1; k++) { if (bad.has(p.slice(k).join('.'))) return true; }
    return false;
  }
  document.addEventListener('focusin', function (e) { if (e.target && e.target.type === 'email') load(); });
  document.addEventListener('input', function (e) { if (e.target && e.target.type === 'email') e.target.setCustomValidity(''); });
  document.addEventListener('submit', function (e) {
    var f = e.target, el = f && f.querySelector ? f.querySelector('input[type=email]') : null;
    if (!el) return;
    if (isBad(domainOf(el.value)) || isRelay(el.value)) {
      e.preventDefault(); e.stopImmediatePropagation();
      el.setCustomValidity(MSG); el.reportValidity();
    }
  }, true);
})();
