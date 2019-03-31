// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '640',
    width: '900',
    videoId: '0N9McnK2kh0',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

var videoTime = 0;
var timeUpdater = null;
var showingBoard = false;
var justShowedBoard = false;
// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  // event.target.playVideo();
  function updateTime() {
    var oldTime = videoTime;
    if(player && player.getCurrentTime) {
      videoTime = player.getCurrentTime();
    }
    if(videoTime !== oldTime) {
      onProgress(videoTime);
    }
  }
  timeUpdater = setInterval(updateTime, 100);
}

// when the time changes, this will be called.
function onProgress(currentTime) {
  console.log(currentTime);
  if(currentTime >= 129 && currentTime < 130 && !showingBoard && !justShowedBoard) {
    console.log("Trigger");
    triggerScenePizza();
  }
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
    // setTimeout(triggerScenePizza, 6000);
    done = true;
  } else if (event.data == YT.PlayerState.ENDED) {
    setTimeout(triggerScenePractice, 0);
  }
}
function playVideo() {
  player.playVideo();
}
function pauseVideo() {
  player.pauseVideo();
}

function hideBoard() {
  $('.scene').hide();
  $('#board').hide();
  showingBoard = false;
  setTimeout(function () {
    justShowedBoard = false;
  }, 2000);
}
function showBoard() {
  $('.scene').hide();
  $('#board').show();
  showingBoard = true;
  justShowedBoard = true;
}

function startScene(scene) {
  $(scene).fadeIn(function () {
    pauseVideo(); // For sure
  });
}
function continueScene(el) {
  var next = $(el).data('next');
  console.log(next);
  $(el).parent('.scene').fadeOut(function () {
    $(next).fadeIn(function () {
      if (next.includes('scene-timer')) {
        document.getElementById('sound').play();
        setTimeout(continueScene, 4000, $(next).find('.btn-continue'));
      } else if (next.includes('scene-end')) {
        document.getElementById('ending').play();
      }
    });
  });
}
function endScene(el) {
  $(el).parent('.scene').fadeOut(function () {
    hideBoard();
    playVideo();
  });
}
function jumpScene(el) {
  var to = $(el).data('to');
  console.log(to);
  $(el).closest('.scene').fadeOut(function () {
    $(to).fadeIn();
  });
}
function showScene(target) {
  var $scene = $('.scene:visible');
  if ($scene.length == 0) {
    console.log('SHOW', target);
    $(target).show();
  } else {
    $('.scene:visible').fadeOut(function () {
      console.log('FADE IN', target);
      $(target).fadeIn();
    });
  }
}

function triggerScenePizza() {
  pauseVideo();
  showBoard();
  startScene('#scene-title-pizza');
}
function triggerScenePractice() {
  showBoard();
  startScene('#scene-title-practice');
}
function triggerSceneEnd() {
  showBoard();
  startScene('#scene-end');
}

function showSceneByStatus(status) {
  var scenes = [
    'join',
    'joined',
    'learned',
    'discussed',
    'practiced',
    'taught',
    'quizzed'
  ];
  showScene('#scene-' + scenes[status]);
}

// Template

function buildOptionTeam(tid, name, icon) {
  return '<div class="frame option" data-next="' + tid + '">\
    <p><i class="fas fa-' + icon + '"></i></p>\
    <p>Team ' + name + '</p>\
  </div>';
}

// Auth

function login(email, password) {
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log('LOGIN', errorCode, errorMessage);
  });
}

function signup(email, password) {
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log('SIGNUP', errorCode, errorMessage);
  });
}

function logout() {
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
    console.log('LOGOUT');
  }).catch(function(error) {
    // An error happened.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log('LOGOUT', errorCode, errorMessage);
  });
}

function isLoggedIn() {
  return !!firebase.auth().currentUser;
}

// User

var userDoc;

function getUser(uid, success, fail) {
  var db = firebase.firestore();
  var usersRef = db.collection('users').where('uid', '==', uid);
  usersRef.get().then(function(res) {
    if (!res.empty) {
      console.log('USER', res.docs);
      userDoc = res.docs[0];
      success(userDoc.data());
    } else {
      console.log('No such user!');
      fail();
    }
  }).catch(function(error) {
    console.log('Error getting user:', error);
  });
}

function initUser(auth) {
  console.log('USER ADD', auth.uid);
  var db = firebase.firestore();
  db.collection('users').add({
    uid: auth.uid,
    email: auth.email,
    status: 0
  }).then(function(docRef) {
    console.log('User written with ID:', docRef.id);
  }).catch(function(error) {
    console.error('Error adding user:', error);
  });
}

function updateStatus() {
  var db = firebase.firestore();
  var userRef = db.collection('users').doc(userDoc.id);
  var status = userDoc.data().status + 1;
  return userRef.update({
    status: status
  }).then(function() {
    console.log('User successfully updated!');
    showSceneByStatus(status)
  }).catch(function(error) {
    console.error('Error updating user:', error);
  });
}

function updateUserTeam(tid) {
  var db = firebase.firestore();
  var userRef = db.collection('users').doc(userDoc.id);
  return userRef.update({
    tid: tid
  }).then(function() {
    console.log('User successfully updated!');
  }).catch(function(error) {
    console.error('Error updating user:', error);
  });
}

// Team
var teamDocs = [];
function getTeams(success) {
  var db = firebase.firestore();
  var teamsRef = db.collection('teams');
  teamsRef.get().then(function(res) {
    if (!res.empty) {
      console.log('TEAMS', res.docs);
      // teams = doc.docs.map(function(doc) {
      //   return doc.data();
      // });
      teamDocs = res.docs;
      success(teamDocs);
    } else {
      console.log('No such teams!');
    }
  }).catch(function(error) {
    console.log('Error getting teams:', error);
  });
}

function joinTeam(tid, uid) {
  var db = firebase.firestore();
  var teamRef = db.collection('teams').doc(tid);
  return teamRef.update({
    members: firebase.firestore.FieldValue.arrayUnion(uid)
  }).then(function() {
    console.log('Team successfully updated!');
  }).catch(function(error) {
    console.error('Error updating team:', error);
  });
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function addZero(n) {
  return n < 10 ? '0' + n : '' + n;
}

var teamDoc;
function getTeam(tid, success) {
  var db = firebase.firestore();
  var teamRef = db.collection('teams').doc(tid);
  teamRef.get().then(function(doc) {
    if (doc.exists) {
      console.log('TEAM', doc.data());
      teamDoc = doc;
      success(teamDoc);
    } else {
      console.log('No such team!');
    }
  }).catch(function(error) {
    console.log('Error getting team:', error);
  });
}

var part;
function getPart(teamDoc) {
  var team = teamDoc.data();
  var uid = firebase.auth().currentUser.uid;
  var index = team.members.indexOf(uid);
  part = team.assign[index];
  console.log('PART', part);
}

function schedule(tid) {
  // Schedule
  var rand = getRandomInt(1, 2);
  var left = rand == 1 ? 2 : 1;
  var now = new Date();
  var date = now.getFullYear() + '-' + addZero(now.getMonth() + 1) + '-' + addZero(now.getDate() + (now.getHours() >= 18 ? 1 : 0));
  var discussAt = new Date(date + 'T19:00:00');
  var teachAt = new Date(date + 'T20:00:00');
  var data = {
    assign: [rand, left],
    discussAt: discussAt,
    teachAt: teachAt
  };
  // Update cloud team
  var db = firebase.firestore();
  var teamRef = db.collection('teams').doc(tid);
  return teamRef.update(data).then(function() {
    console.log('Team successfully updated!');
  }).catch(function(error) {
    console.error('Error updating team:', error);
  });
}

$(document).ready(function () {
  showBoard();
  $('#scene-blank').show();

  // Global Events
  $('.btn-continue').click(function () {
    if (!$(this).hasClass('btn-disabled')) {
      continueScene(this);
    }
  })
  $('.btn-jump').click(function () {
    jumpScene(this);
  })
  $('.btn-end').click(function () {
    endScene(this);
  })
  $('.btn-share').click(function () {
    var url = "https://polarischen.github.io/tol-glasses/";
    var text = "Do you know how glasses work? Check this out! 😎";
    var twitterWindow = window.open('https://twitter.com/share?url=' + url + '&text=' + text, 'twitter-popup', 'height=350, width=600');
    if (twitterWindow.focus) {
      twitterWindow.focus();
    }
  })
  $('.select').on('click', '.option', function () {
    var $select = $(this).parent('.select');
    if (!$select.hasClass('select-disabled')) {
      $select.find('.option').removeClass('option-selected');
      $(this).addClass('option-selected');

      var $btn = $select.parent('.scene').children('a');
      $btn.removeClass('btn-disabled');

      var next = $(this).data('next');
      if (next) {
        var target = $select.data('target');
        var $btnTarget = $(target).children('a');
        $btnTarget.data('next', next);
      }
    }
  })
  $('.input-answer').on('change keyup paste', function() {
    var $btn = $(this).parent('.scene').find('.btn-continue');
    if ($(this).val().length === 0) {
      $btn.addClass('btn-disabled');
    } else {
      $btn.removeClass('btn-disabled');
    }
  })

  $('#btn-login').click(function () {
    var email = $('#input-login-email').val();
    var password = $('#input-login-password').val();
    console.log('LOGIN', email, password);
    login(email, password);
  })
  $('#btn-signup').click(function () {
    var email = $('#input-signup-email').val();
    var password = $('#input-signup-password').val();
    console.log('SIGNUP', email, password);
    signup(email, password);
  })
  $('#btn-logout').click(function () {
    logout();
  })

  $('.btn-start').click(function () {
    console.log('START');
    if (isLoggedIn()) {
      showScene('#scene-join');
    } else {
      showScene('#scene-login');
    }
  })

  $('#btn-join').click(function () {
    console.log('JOIN');
    var tid = $(this).data('next');
    var uid = firebase.auth().currentUser.uid;
    if (joinTeam(tid, uid)) {
      console.log('JOIN', tid, uid);
      updateStatus();
      updateUserTeam(tid);
      schedule(tid);
      getTeam(tid, getPart);
    } else {
      console.log('JOIN NULL');
    }
  })

  getTeams(function(teamDocs) {
    var $teamSelect = $('#scene-join .select');
    $teamSelect.empty();
    var count = 0;
    var max = 4;
    teamDocs.forEach(function(teamDoc) {
      var team = teamDoc.data();
      if (count <= max && team.members.length == 1) {
        $teamSelect.append(buildOptionTeam(teamDoc.id, team.name, team.icon));
        count++;
      }
    });
  });

  // getQuiz();

  // Listen user state change
  firebase.auth().onAuthStateChanged(function(auth) {
    if (auth) {
      // User is logged in
      console.log('AUTH', auth);
      // Check User
      getUser(auth.uid, function(user) {
        // Check Status
        console.log('CHECK STATUS', user);
        showSceneByStatus(user.status);
        if (user.status > 0) {
          getTeam(user.tid, getPart);
          // getPractice();
        }
      }, function() {
        console.log('INIT USER');
        initUser(auth);
        showSceneByStatus(0);
      });

    } else {
      // No user is logged in
      console.log('AUTH NULL');
      showScene('#scene-start');
      // showScene('#scene-join');
    }
  });
})
