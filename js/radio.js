/*!
 *  Howler.js Radio Demo
 *  howlerjs.com
 *
 *  (c) 2013-2018, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

// Cache references to DOM elements.
var elms = ['station0', 'title0', 'live0', 'current0', 'playing0', 'station1', 'title1', 'live1', 'current1', 'playing1', 'station2', 'title2', 'live2', 'current2', 'playing2', 'station3', 'title3', 'live3', 'current3', 'playing3', 'station4', 'title4', 'live4', 'current4', 'playing4'];
elms.forEach(function(elm) {
  window[elm] = document.getElementById(elm);
});


/**
 * Radio class containing the state of our stations.
 * Includes all methods for playing, stopping, etc.
 * @param {Array} stations Array of objects with station details ({title, src, howl, ...}).
 */
var Radio = function(stations) {
  var self = this;

  self.stations = stations;
  self.index = 0;

  // Setup the display for each station.
  for (var i=0; i<self.stations.length; i++) {
    window['title' + i].innerHTML = '<b>' + self.stations[i].freq + '</b> ' + self.stations[i].title;
    window['station' + i].addEventListener('click', function(index) {
      var isNotPlaying = (self.stations[index].howl && !self.stations[index].howl.playing());

      // Stop other sounds or the current one.
      radio.stop();

      // If the station isn't already playing or it doesn't exist, play it.
      if (isNotPlaying || !self.stations[index].howl) {
        radio.play(index);
      }
    }.bind(self, i));
  }
};

Radio.prototype = {
  /**
   * Play a station with a specific index.
   * @param  {Number} index Index in the array of stations.
   */
  play: function(index) {
    var self = this;
    var sound;

    index = typeof index === 'number' ? index : self.index;
    self.data = self.stations[index];

    // If we already loaded this track, use the current one.
    // Otherwise, setup and load a new Howl.
    if (self.data.howl) {
      sound = self.data.howl;
    } else {
      sound = self.data.howl = new Howl({
        src: self.data.src,
        html5: true, // A live stream can only be played through HTML5 Audio.
        format: ['mp3', 'aac']
      });
    }

    // Begin playing the sound.
    sound.play();

    // Toggle the display.
    self.toggleStationDisplay(index, true);

    // Keep track of the index we are currently playing.
    self.index = index;

    // Update channel metadata every 10s
    self.updateMetadata();
    self.updateMetadataLoop = setInterval(function () {
      self.updateMetadata();
    }, 10000);

  },

  /**
   * Stop a station's live stream.
   */
  stop: function() {
    var self = this;

    // Get the Howl we want to manipulate.
    var sound = self.stations[self.index].howl;

    // Toggle the display.
    self.toggleStationDisplay(self.index, false);

    // Stop metadata update loop
    clearInterval(self.updateMetadataLoop);

    // Stop the sound.
    if (sound) {
      sound.stop();
      sound.unload();
    }
  },

  /**
   * Toggle the display of a station to off/on.
   * @param  {Number} index Index of the station to toggle.
   * @param  {Boolean} state true is on and false is off.
   */
  toggleStationDisplay: function(index, state) {
    var self = this;

    // Highlight/un-highlight the row.
    window['station' + index].style.backgroundColor = state ? 'rgba(255, 255, 255, 0.33)' : '';

    // Show/hide the "live" marker.
    window['live' + index].style.opacity = state ? 1 : 0;

    // Show/hide the "playing" animation.
    window['playing' + index].style.display = state ? 'block' : 'none';

    // Show/hide the metadata.
    window['current' + index].style.display = state ? 'inline-block' : 'none';
  },

  updateMetadata: function() {
    var self = this;

    // Get and set metadata asynchronously from IceCast XSPF XML data
    $.ajax({type: "GET",
      url: self.data.current,
      dataType: "xml",
      cache: false,
      async: true,
      crossDomain: true,
      success: function(xml) {
        $(xml).find("title").each(function(index)   {
          var title = $(this).text();
          // var date = new Date();
          // title += date.getTime()
          window['current' + self.index].innerHTML = title;
        })
      }
    });
  }

};

var stations = [
  {
    freq: '',
    title: "DeeFuzz Full",
    src: 'https://stream.parisson.com/icecast/deefuzz_full.mp3',
    howl: null,
    current: 'https://stream.parisson.com/icecast/deefuzz_full.mp3.xspf',
  },
  {
    freq: '',
    title: "DeeFuzz House",
    src: 'https://stream.parisson.com/icecast/deefuzz_house.mp3',
    howl: null,
    current: 'https://stream.parisson.com/icecast/deefuzz_house.mp3.xspf',
  },
  {
    freq: '',
    title: "DeeFuzz Techno",
    src: 'https://stream.parisson.com/icecast/deefuzz_techno.mp3',
    howl: null,
    current: 'https://stream.parisson.com/icecast/deefuzz_techno.mp3.xspf',
  },
  {
    freq: '',
    title: "DeeFuzz Jungle",
    src: 'https://stream.parisson.com/icecast/deefuzz_jungle.mp3',
    howl: null,
    current: 'https://stream.parisson.com/icecast/deefuzz_jungle.mp3.xspf',
  },
  {
    freq: '',
    title: "DeeFuzz Down Tempo",
    src: 'https://stream.parisson.com/icecast/deefuzz_down_tempo.mp3',
    howl: null,
    current: 'https://stream.parisson.com/icecast/deefuzz_down_tempo.mp3.xspf',
  },
]

// Setup our new radio and pass in the stations.
var radio = new Radio(stations);
