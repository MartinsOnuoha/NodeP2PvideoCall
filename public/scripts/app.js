const app = document.getElementById('video-space')
const userVideo = document.createElement('video')
const socket = io('/');
const participants = []
let myVideoStream = null

const peer = new Peer(null, {
  path: '/peer',
  host: '/',
  port: '443'
})

let cameraMode = 'user'
const constrains = {
  audio: true,
  video: true
}
/**
 * get media request from client
 * @param {MediaStreamConstraints} constrains
 */
const getMediaStream = async (constrains) => {
  if (navigator.mediaDevices !== undefined) {
    let stream = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia(constrains)
      myVideoStream = stream
      addStreamToVideo(userVideo, stream)

      // answer a call
      peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addStreamToVideo(video, userVideoStream)
        })
      })
      socket.on('user-connected', (userId) => {
        handleNewConnection(userId, stream)
      })
    } catch (e) {
      console.error(e)
    }
  }
}

/**
 * add a stream to video object
 * @param {HTMLVideoObject} video
 * @param {MediaStream} stream
 */
const addStreamToVideo = (video, stream) => {
  video.muted = true
  video.srcObject = stream
  video.onloadedmetadata = (e) => video.play()

  render(video)
}

/** listen for peer connection */
peer.on('open', id => {
  socket.emit('join-room', ROOMID, id)
})

/**
 * handle new connection and send video stream
 */
const handleNewConnection = (userId, stream) => {
  participants.push(userId)
  const call = peer.call(userId, stream) // call user with Id and send him your stream
  const newUserVideo = document.createElement('video')
  call.on('stream', remoteStream => {
    addStreamToVideo(newUserVideo, remoteStream)
  })
}

const respondToCall = () => {
  peer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addStreamToVideo(video, userVideoStream)
    })
  })
}

/**
 * mute & unmute audio
 */
const muteBtnIcon = document.getElementById('muteBtnIcon')

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    showUnMuteButton()
    return
  }
  myVideoStream.getAudioTracks()[0].enabled = true;
  showMuteButton()
}

const showUnMuteButton = () => {
  muteBtnIcon.classList.remove('fa-microphone-slash')
  muteBtnIcon.classList.add('fa-microphone')
}

const showMuteButton = () => {
  muteBtnIcon.classList.remove('fa-microphone')
  muteBtnIcon.classList.add('fa-microphone-slash')
}

/**
 * enable and disable video stream
 */
const videoBtnIcon = document.getElementById('videoBtnIcon')

const enableDisableVideo = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  console.log(myVideoStream.getVideoTracks())
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false
    showVideoDisabled()
    return
  }
  myVideoStream.getVideoTracks()[0].enabled = true
  showVideoEnabled()
}

const showVideoDisabled = () => {
  videoBtnIcon.classList.remove('fa-video-camera')
  videoBtnIcon.classList.remove('fa')
  videoBtnIcon.classList.add('fa-video-slash')
  videoBtnIcon.classList.add('fas')
}

const showVideoEnabled = () => {
  videoBtnIcon.classList.remove('fa-video-slash')
  videoBtnIcon.classList.add('fa-video-camera')
}

/**
 * Share screen
 */
const shareScreen = async () => {
  let screenStream = await navigator.mediaDevices.getDisplayMedia({
    video: true
  });
  if (participants.length > 0) {
    const userId = participants[0]
    const call = peer.call(userId, screenStream)

    const newScreenSharingVideo = document.createElement('video')
    newScreenSharingVideo.classList.add('screen-share')
    call.on('stream', screenShareStream => {
      addStreamToVideo(newScreenSharingVideo, screenShareStream)
    })
  }
  // peer.call()
}

const copyLink = () => {
  document.getElementById('myUrl').style.display = 'block'
  const url = window.location.href
  document.getElementById('myUrl').value = url
  document.getElementById('myUrl').select();

  /* Copy the text inside the text field */
  document.execCommand("copy");
  alert('Link Copied to Clipboard')
  document.getElementById('myUrl').style.display = 'none'
}
/**
 * render content to app page.
 * @param {HTMLDOMObject} content
 */
const render = (content) => {
  app.append(content)
}
getMediaStream(constrains)
