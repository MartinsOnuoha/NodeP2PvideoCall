'use strict';

const input = document.querySelector('input')
const chatWindow = document.querySelector('ul')

document.addEventListener('keydown', (event) => {
  const keyName = event.key.toLowerCase();
  const message = input.value
  if (keyName === 'enter' && message.length > 0) {
    console.log(message)
    socket.emit('new-message', message)
    input.value = ''
  }
});

socket.on('create-new-message', message => {
  console.log('new message received', message)
  const newMessageList = document.createElement('li')
  newMessageList.classList.add('message-list')
  newMessageList.innerHTML = message
  chatWindow.appendChild(newMessageList)
  scrollToBottom()
})

const scrollToBottom = () => {
  let chatWindow = document.querySelector('.main__chat-window')
  window.scrollTo(0, chatWindow.getAttribute('scrollHeight'))
}
