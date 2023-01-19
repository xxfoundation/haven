export const isDuplicatedWindow = function(
  localStorageTimeout,
  localStorageResetInterval,
  localStorageTabKey
) {
  var ItemType = {
    Session: 1,
    Local: 2
  };

  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/';
  }

  function getCookie(name) {
    var nameEQ = name + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  function GetItem(itemtype) {
    var val = '';
    switch (itemtype) {
      case ItemType.Session:
        val = window.name;
        break;
      case ItemType.Local:
        val = decodeURIComponent(getCookie(localStorageTabKey));
        if (val == undefined) val = '';
        break;
    }
    return val;
  }

  function SetItem(itemtype, val) {
    switch (itemtype) {
      case ItemType.Session:
        window.name = val;
        break;
      case ItemType.Local:
        setCookie(localStorageTabKey, val);
        break;
    }
  }

  function createGUID() {
    const s4 = function() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    
    return (
      s4() +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      '-' +
      s4() +
      s4() +
      s4()
    );
  }

  /**
   * Compare our tab identifier associated with this session (particular tab)
   * with that of one that is in window name Storage (the active one for this browser).
   * This browser tab is good if any of the following are true:
   * 1.  There is no cookie Storage Guid yet (first browser tab).
   * 2.  The window name Storage Guid matches the cookie Guid.  Same tab, refreshed.
   * 3.  The window name Storage timeout period has ended.
   *
   * If our current session is the correct active one, an interval will continue
   * to re-insert the window name Storage value with an updated timestamp.
   *
   * Another thing, that should be done (so you can open a tab within 15 seconds of closing it) would be to do the following (or hook onto an existing onunload method):
   */
  function isTabDuplicated() {
    var sessionGuid = GetItem(ItemType.Session) || createGUID();
    SetItem(ItemType.Session, sessionGuid);

    var val = GetItem(ItemType.Local);
    var tabObj = (val == '' ? null : JSON.parse(val)) || null;

    // If no or stale tab object, our session is the winner.  If the guid matches, ours is still the winner
    if (
      tabObj === null ||
      tabObj.timestamp < new Date().getTime() - localStorageTimeout ||
      tabObj.guid === sessionGuid
    ) {
      const setTabObj = () => {
        var newTabObj = {
          guid: sessionGuid,
          timestamp: new Date().getTime()
        };
        SetItem(ItemType.Local, JSON.stringify(newTabObj));
      };

      setTabObj();
      setInterval(setTabObj, localStorageResetInterval); //every x interval refresh timestamp in cookie
      window.onunload = () => {
        SetItem(ItemType.Local, '');
        localStorage.removeItem(localStorageTabKey);
      };
      return false;
    } else {
      // An active tab is already open that does not match our session guid.
      return true;
    }
  }
  
  return isTabDuplicated();
};
