'use strict';

window.CamRecorder = class CamRecorder {
  constructor(expected_media) {
    this.constraints = expected_media;
    this.is_live = false;
    this.sentData = 0;
    this.socket = io(); // We assume socket.io is embeded.

    this.video = null;
    this.mediaRecorder = null;
    this.recorderIntervalId = null;

    this.socket.emit('transmission', true);
  }

  set videoElement(htmlElement) {
    // Pass the specified html element or find the first video element in the DOM.
    this.video = htmlElement || document.querySelector('video');
  }

  startMedia() {
    if (this.video && !this.is_live) {
      navigator.mediaDevices
        .getUserMedia(this.constraints)
        .then((stream) => {
          this.is_live = true;
          this.video.srcObject = stream;
          this.video.addEventListener('loadedmetadata', (e) => { this.video.play() });
          this.startRecording(stream);
          })
        .catch((err) => { console.log('Error initializing media stream', err); });

      // Every 2 secs, stop recording and report data.
      this.recorderIntervalId = setInterval(() => {
        if (this.mediaRecorder) {
          this.mediaRecorder.stop();
          this.mediaRecorder.start();
        }
      }, 3000);

    }
  }

  startRecording(stream) {
    // (Youtube) Live encoding settings for videoBit rate https://support.google.com/youtube/answer/2853702?hl=en
    // (Adobe) https://www.adobe.com/devnet/adobe-media-server/articles/dynstream_live/popup.html
    this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=opus,vp8',
                                                     audioBitsPerSecond: 128000, // 128 Kbit/sec
                                                     videoBitsPerSecond: 2000000 /* 2Mbit/sec */ });

    // Setup recording data handler
    this.mediaRecorder.ondataavailable = (eventBlob) => {
      this.sentData += eventBlob.data.size;
      if (eventBlob.data.size > 0) this.broadcastData(eventBlob.data);
    };

    this.mediaRecorder.start();
  }

  broadcastData(data) {
    this.socket.emit('video', data);
  }
}
