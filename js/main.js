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

$(document).ready(function () {
  showBoard();
  $('#scene-start').show();

  $('.btn-start').click(function () {
    // hideBoard();
    // playVideo();
    // startScene('#scene-title');
  })
  $('.btn-continue').click(function () {
    if (!$(this).hasClass('btn-disabled')) {
      continueScene(this);
    }
  })
  $('.btn-end').click(function () {
    endScene(this);
  })
  $('.btn-share').click(function () {
    var url = "https://polarischen.github.io/tol-microwave/";
    var text = "Do you know how microwave ovens work? Check this out! 😉";
    var twitterWindow = window.open('https://twitter.com/share?url=' + url + '&text=' + text, 'twitter-popup', 'height=350, width=600');
    if (twitterWindow.focus) {
      twitterWindow.focus();
    }
  })
  $('.option').click(function () {
    $(this).parent('.gallery').find('.option').removeClass('option-selected');
    $(this).addClass('option-selected');
  })
  $('.select .option').click(function () {
    var $btn = $(this).parent('.select').parent('.scene').find('.btn-continue');
    $btn.removeClass('btn-disabled');

    var next = $(this).data('next');
    var target = $(this).parent('.select').data('target');
    var $btnTarget = $(target).find('.btn-continue');
    $btnTarget.data('next', next);
  })
  $('.input-answer').on('change keyup paste', function() {
    var $btn = $(this).parent('.scene').find('.btn-continue');
    if ($(this).val().length === 0) {
      $btn.addClass('btn-disabled');
    } else {
      $btn.removeClass('btn-disabled');
    }
  })
})
