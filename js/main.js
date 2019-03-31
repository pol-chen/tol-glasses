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

function updateVideo(videoId) {
  player.loadVideoById(videoId)
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
  // console.log(currentTime);
  // if(currentTime >= 129 && currentTime < 130 && !showingBoard && !justShowedBoard) {
  //   console.log("Trigger");
  //   triggerScenePizza();
  // }
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
    setTimeout(triggerSceneLearning, 0);
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
    if (next.includes('scene-correct-p') || next.includes('scene-wrong-p')) {
      loadPracticeFeedback();
    } else if (next.includes('scene-correct-q') || next.includes('scene-wrong-q')) {
      loadQuizFeedback();
    }
    if (next.includes('scene-correct-q')) {
      countPoint();
    }
    $(next).fadeIn(function () {
      if (next.includes('scene-timer')) {
        // document.getElementById('sound').play();
        // setTimeout(continueScene, 4000, $(next).find('.btn-continue'));
      } else if (next.includes('scene-end')) {
        // document.getElementById('ending').play();
      }
    });
  });
}
function endScene() {
  $('.scene:visible').fadeOut(function () {
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

function triggerSceneLearning() {
  showBoard();
  startScene('#scene-learning');
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

function buildOptionTeam(tid, name, icon, isNew) {
  var count = isNew ? '' : '<br/>[1/2]';
  var line = isNew ? '<br/>' : ' ';
  return '<div class="frame option" data-next="' + tid + '">\
    <p><i class="fas fa-' + icon + '"></i></p>\
    <p>Team' + line + name + count + '</p>\
  </div>';
}

function buildOptionQuestionP(op, i) {
  var feedback = op.correct ? 'correct' : 'wrong';
  var nums = ['A', 'B', 'C', 'D'];
  var num = nums[i];
  return '<div class="frame option" data-next="#scene-' + feedback + '-p">\
    <p>' + num + '. ' + op.desc + '</p>\
  </div>';
}

function buildOptionQuestionQ(op, i) {
  var feedback = op.correct ? 'correct' : 'wrong';
  var nums = ['A', 'B', 'C', 'D'];
  var num = nums[i];
  return '<div class="frame option" data-next="#scene-' + feedback + '-q">\
    <p>' + num + '. ' + op.desc + '</p>\
  </div>';
}

function buildOptionChecklist(item) {
  return '<div class="frame option">\
    <p><span><i class="far fa-circle"></i></span>' + item + '</p>\
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

function updateScore(score) {
  var db = firebase.firestore();
  var userRef = db.collection('users').doc(userDoc.id);
  return userRef.update({
    score: score
  }).then(function() {
    console.log('User score successfully updated!');
  }).catch(function(error) {
    console.error('Error updating user score:', error);
  });
}

function updateUserTeam(tid) {
  var db = firebase.firestore();
  var userRef = db.collection('users').doc(userDoc.id);
  return userRef.update({
    tid: tid,
    score: 0
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

function updateTeams(teamDocs) {
  console.log('updateTeams', teamDocs);
  var $teamSelect = $('#scene-join .select');
  var $teamSelectFound = $('#scene-found .select');
  $teamSelect.empty();
  $teamSelectFound.empty();
  var count = 0;
  var max = 4;
  teamDocs.forEach(function(teamDoc) {
    var team = teamDoc.data();
    console.log(team);
    if (team.members.length == 0) {
      $teamSelectFound.append(buildOptionTeam(teamDoc.id, team.name, team.icon, true));
    }
    if (count <= max && team.members.length > 0) {
      $teamSelect.append(buildOptionTeam(teamDoc.id, team.name, team.icon, false));
      count++;
    }
  });
}

function joinTeam(tid, uid) {
  var db = firebase.firestore();
  var teamRef = db.collection('teams').doc(tid);
  return teamRef.update({
    members: firebase.firestore.FieldValue.arrayUnion(uid),
    ranking: 0,
    score: 0
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
      updateTeamInfo();
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

  updateChecklist(part);
}

function updateTeamIcon(icon) {
  var i = '<i class="fas fa-' + icon + '"></i>';
  $('.icon-team').html(i);
}

function updateTeamInfo() {
  var team = teamDoc.data();
  updateTeamIcon(team.icon);
  if (team.discussAt) {
    console.log('TIME', team.discussAt);
    $('.discuss-time').text(new Date(team.discussAt.seconds * 1000).toString());
  }
  if (team.teachAt) {
    $('.teach-time').text(new Date(team.teachAt.seconds * 1000).toString());
  }
  if (team.score) {
    $('#score').text(team.score);
  }
  if (team.ranking) {
    $('#ranking').text(team.ranking);
    $('#scene-quizzed a').removeClass('btn-disabled');
  }
}

function updateTeamScore(score) {
  var db = firebase.firestore();
  var teamRef = db.collection('teams').doc(teamDoc.id);
  return teamRef.update({
    score: score,
  }).then(function() {
    console.log('Team score successfully updated!');
  }).catch(function(error) {
    console.error('Error updating team score:', error);
  });
}

function updateTeamRanking(ranking) {
  var db = firebase.firestore();
  var teamRef = db.collection('teams').doc(teamDoc.id);
  return teamRef.update({
    ranking: ranking,
  }).then(function() {
    console.log('Team ranking successfully updated!');
  }).catch(function(error) {
    console.error('Error updating team ranking:', error);
  });
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

function learn() {
  var videoIds = ['0N9McnK2kh0', '0N9McnK2kh0'];
  updateVideo(videoIds[part - 1]);
  endScene();
}

// Practice
var questionDocs;
var practices;
var currentPractice = 0;
var quizzes;
var currentQuiz = 0;
function getQuestions() {
  // Get questions from cloud
  loadPractice(); // Init first question
  loadQuiz();
  console.log('Practice');
}

function loadPractice() {
  console.log('Load');
  practices = [{
    desc: 'Apple',
    image: '',
    options: [
      {
        desc: 'Food',
        correct: false
      },
      {
        desc: 'Ceramics',
        correct: false
      },
      {
        desc: 'Glass',
        correct: false
      },
      {
        desc: 'Metal',
        correct: true
      }
    ],
    feedbacks: [
      'NO',
      'YES'
    ],
    part: 2
  },{
    desc: 'Banana',
    image: '',
    options: [
      {
        desc: 'Food2',
        correct: false
      },
      {
        desc: 'Ceramics2',
        correct: false
      },
      {
        desc: 'Glass2',
        correct: false
      },
      {
        desc: 'Metal2',
        correct: true
      }
    ],
    feedbacks: [
      'NO2',
      'YES2'
    ],
    part: 1
  }];

  var p = practices[currentPractice++];
  $('#scene-question-p h2').text('Question ' + currentPractice);
  $('#scene-question-p p').text(p.desc);
  $('#scene-question-p .btn-continue').addClass('btn-disabled');
  $('#scene-question-p .select').empty();
  p.options.forEach(function(option, i) {
    console.log(option, i);
    $('#scene-question-p .select').append(buildOptionQuestionP(option, i));
  });
}

function loadPracticeFeedback() {
  var p = practices[currentPractice-1];
  $('#scene-wrong-p p').text(p.feedbacks[0]);
  $('#scene-correct-p p').text(p.feedbacks[1]);
}

// Quiz

function loadQuiz() {
  quizzes = [{
    desc: 'Apple11',
    image: '',
    options: [
      {
        desc: 'Food11',
        correct: false
      },
      {
        desc: 'Ceramics11',
        correct: false
      },
      {
        desc: 'Glass11',
        correct: false
      },
      {
        desc: 'Metal11',
        correct: true
      }
    ],
    feedbacks: [
      'NO11',
      'YES11'
    ],
    part: 2
  },{
    desc: 'Banana',
    image: '',
    options: [
      {
        desc: 'Food2',
        correct: false
      },
      {
        desc: 'Ceramics2',
        correct: false
      },
      {
        desc: 'Glass2',
        correct: false
      },
      {
        desc: 'Metal2',
        correct: true
      }
    ],
    feedbacks: [
      'NO2',
      'YES2'
    ],
    part: 1
  }];

  var p = quizzes[currentQuiz++];
  $('#scene-question-q h2').text('Question ' + currentQuiz);
  $('#scene-question-q p').text(p.desc);
  $('#scene-question-q .btn-continue').addClass('btn-disabled');
  $('#scene-question-q .select').empty();
  p.options.forEach(function(option, i) {
    console.log(option, i);
    $('#scene-question-q .select').append(buildOptionQuestionQ(option, i));
  });
}

function loadQuizFeedback() {
  var p = quizzes[currentQuiz-1];
  $('#scene-wrong-q p').text(p.feedbacks[0]);
  $('#scene-correct-q p').text(p.feedbacks[1]);
}

// Score

var score = 0;
var total = 2;
function countPoint() {
  score++;
}

function calculateScore() {
  var teammate = getRandomInt(0, total);
  console.log('SCORE TEAMMATE', teammate);
  var avg = (score + teammate).toFixed(1) / 2.0;
  $('#score').text(avg);

  updateTeamScore(avg);
}

function calculateRanking() {
  var ranking = getRandomInt(1, 9);
  console.log('SCORE RANKING', ranking);
  $('#ranking').text(ranking);

  updateTeamRanking(ranking);
}

// Checklist

var checklists = [
  [
    'Eye structure',
    'What causes blurry vision',
    'Differences between myopic and hyperopia'
  ], [
    'Different types of lenses',
    'How do lenses change the path of light',
    'Application of lenses to help improve vision'
  ]
];

function updateChecklist(part) {
  var mine = part - 1;
  var other = mine == 1 ? 0 : 1;
  loadChecklist('#checklist-discuss', checklists[mine]);
  loadChecklist('#checklist-teach-1', checklists[mine]);
  loadChecklist('#checklist-teach-2', checklists[other]);
}

function loadChecklist(el, items) {
  $(el).empty();
  items.forEach(function(item) {
    $(el).append(buildOptionChecklist(item));
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
  $('.btn-continue-p').click(function () {
    if (currentPractice == practices.length) {
      showScene('#scene-practiced');
      updateStatus();
    } else {
      showScene('#scene-question-p');
      loadPractice();
    }
  })
  $('.btn-continue-q').click(function () {
    if (currentQuiz == quizzes.length) {
      showScene('#scene-quizzed');
      updateStatus();
      updateScore(score);
      console.log('SCORE', score);
    } else {
      showScene('#scene-question-q');
      loadQuiz();
    }
  })
  $('.btn-jump').click(function () {
    jumpScene(this);
  })
  $('.btn-end').click(function () {
    endScene();
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
  $('.select-checklist').on('click', '.option', function () {
    var $select = $(this).parent('.select');
    $(this).toggleClass('option-selected');
    if ($(this).hasClass('option-selected')) {
      $(this).find('i').removeClass('fa-circle');
      $(this).find('i').addClass('fa-check-circle');
    } else {
      $(this).find('i').removeClass('fa-check-circle');
      $(this).find('i').addClass('fa-circle');
    }

    var optionsSelected = $select.parent('.scene').find('.option-selected');
    var options = $select.parent('.scene').find('.option');
    var $btn = $select.parent('.scene').children('a');
    if (optionsSelected.length == options.length) {
      $btn.removeClass('btn-disabled');
    } else {
      $btn.addClass('btn-disabled');
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
  $('.btn-logout').click(function () {
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
    if (!$(this).hasClass('btn-disabled')) {
      console.log('JOIN');
      var tid = $(this).data('next');
      var uid = firebase.auth().currentUser.uid;
      if (joinTeam(tid, uid)) {
        console.log('JOIN', tid, uid);
        updateStatus();
        updateUserTeam(tid);
        schedule(tid);
        getTeam(tid, getPart);
        getQuestions();
      } else {
        console.log('JOIN NULL');
      }
    }
  })
  $('#btn-found').click(function () {
    if (!$(this).hasClass('btn-disabled')) {
      console.log('FOUND');
      var tid = $(this).data('next');
      var uid = firebase.auth().currentUser.uid;
      if (joinTeam(tid, uid)) {
        console.log('JOIN', tid, uid);
        updateStatus();
        updateUserTeam(tid);
        schedule(tid);
        getTeam(tid, getPart);
        getQuestions();
      } else {
        console.log('JOIN NULL');
      }
    }
  })
  $('#btn-learn').click(function () {
    console.log('LEARN');
    learn();
  })
  $('#btn-replay').click(function () {
    learn();
  })
  $('#btn-learned').click(function () {
    updateStatus();
  })
  $('#btn-discussed').click(function () {
    if (!$(this).hasClass('btn-disabled')) {
      updateStatus();
    }
  })
  $('#btn-taught').click(function () {
    if (!$(this).hasClass('btn-disabled')) {
      updateStatus();
    }
  })
  $('#btn-score').click(function () {
    calculateScore();
  })
  $('#btn-ranking').click(function () {
    calculateRanking();
    $('#scene-quizzed a').removeClass('btn-disabled');
  })

  // Listen user state change
  firebase.auth().onAuthStateChanged(function(auth) {
    if (auth) {
      // User is logged in
      console.log('AUTH', auth);
      // Get teams
      getTeams(updateTeams);

      // Check user
      getUser(auth.uid, function(user) {
        // Check status
        console.log('CHECK STATUS', user);
        showSceneByStatus(user.status);
        if (user.status > 0) {
          getTeam(user.tid, getPart);
          getQuestions();
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
