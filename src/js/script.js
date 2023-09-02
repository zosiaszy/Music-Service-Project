

/* global Handlebars, GreenAudioPlayer */

const templates = {
  songTemplate: Handlebars.compile(document.getElementById('template-song').innerHTML),
  searchTemplate: Handlebars.compile(document.getElementById('template-search').innerHTML),
  discoverTemplate: Handlebars.compile(document.getElementById('template-discover').innerHTML),
  navigationTemplate: Handlebars.compile(document.getElementById('template-navigation').innerHTML),
  categoriesTemplate: Handlebars.compile(document.getElementById('template-categories').innerHTML),
  
};

class MusicServiceApp {
  
  constructor() {
    const thisMusicService = this;
    thisMusicService.pages = document.querySelectorAll('#pages section'); 
    thisMusicService.navLinks = document.querySelectorAll('.navbar a'); 
    thisMusicService.songView = document.getElementById('song-view');
    thisMusicService.appUrl = '../db/app.json';
    
    
    
    thisMusicService.initPages();
    thisMusicService.initSongs();
    thisMusicService.initSearchForm();
    thisMusicService.renderCategories();
    thisMusicService.initCategories();
    
    
    
    const searchForm = document.getElementById('search-form');
    searchForm.addEventListener('submit', function(event) {
      event.preventDefault();
      thisMusicService.searchSongs();
    });

    thisMusicService.initDiscover();
    
  }

  initPages() {
    const thisMusicService = this;
    for (let link of thisMusicService.navLinks) {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        const pageId = link.getAttribute('href').replace('#', '');
        thisMusicService.activatePage(pageId);
      });  
      
    }

   
    const idFromHash = window.location.hash.replace('#/', '');
    let pageMatchingHash = thisMusicService.pages[0].id;

    for (let page of this.pages) {
      if (page.id === idFromHash) {
        pageMatchingHash = page.id;
        
        break;
      }
    }
    thisMusicService.activatePage(pageMatchingHash);

   


  }


  activatePage(pageId) {
    const thisMusicService = this;
    for (let page of thisMusicService.pages) {
      page.classList.toggle('active', page.id === pageId);
    }

    for (let link of thisMusicService.navLinks) {
      link.classList.toggle('active', link.getAttribute('href') === '#' + pageId);
    }

    
  }
  

  initSongs() {
    const thisMusicService = this;
    fetch(this.appUrl)
      .then(response => response.json())
      .then(appData => {
        for (let eachSong of appData.songs) {
          const songHTML = templates.songTemplate(eachSong);
          thisMusicService.songView.innerHTML += songHTML;
        }
        
        thisMusicService.initPlayer();
      });
  }
  
  initSearchForm() {
    const thisMusicService = this;
    thisMusicService.searchInput = document.getElementById('search-input');
    thisMusicService.categoryInput = document.getElementById('category-input');
    thisMusicService.categorySelect = document.getElementById('select-category');
    thisMusicService.searchResults = document.getElementById('search-results');
  }


  searchSongs() {
    const thisMusicService = this;
    const searchValue = thisMusicService.searchInput.value.toLowerCase();
    const selectCategory = thisMusicService.categorySelect.value;
    
    fetch(thisMusicService.appUrl)
      .then(response => response.json())
      .then(appData => {
        thisMusicService.searchResults.innerHTML = '';
        
        for (let eachSong of appData.songs) {
          if (
            eachSong.title.toLowerCase().includes(searchValue) &&
            (selectCategory === 'all' || eachSong.categories.includes(selectCategory))
          ) {
            const songHTML = templates.songTemplate(eachSong);
            thisMusicService.searchResults.innerHTML += songHTML; 
          }
        }
        thisMusicService.initPlayer();
     
        
      });
  }

  initPlayer (){
    GreenAudioPlayer.init({ 
      selector: '.player', 
      stopOthersOnPlay: true
    });
    
  }

  renderCategories() {
    const thisMusicService = this;
    const selectCategory = document.getElementById('select-category');

    fetch(thisMusicService.appUrl)
      .then(response => response.json())
      .then(appData => {
     
        selectCategory.innerHTML = '';

      
        const allCategoriesOption = document.createElement('option');
        allCategoriesOption.value = 'all';
        allCategoriesOption.textContent = '';
        selectCategory.appendChild(allCategoriesOption);

      
        for (const category of appData.categories) {
          const categoryOption = document.createElement('option');
          categoryOption.value = category;
          categoryOption.textContent = category;
          selectCategory.appendChild(categoryOption);
        }
      });
  }


  initCategories(){
    const thisMusicService = this;

    const categoriesLinks = document.querySelectorAll('.category-link');

    for(let link of categoriesLinks){
      link.addEventListener('click', function(){
        const selectedCategory = link.getAttribute('data-category');
        thisMusicService.filterCategories(selectedCategory);
     

      });

     
    }

  }

  filterCategories(selectedCategory) {
    const thisMusicService = this;

    const allSongs = thisMusicService.songView.querySelectorAll('.song-container');

    for (let song of allSongs) {
      const songCategories = song.getAttribute('data-categories').split(' ');

      if (selectedCategory === 'all' || songCategories.includes(selectedCategory)) {
        song.classList.remove('hidden');
      } else {
        song.classList.add('hidden');
      }
    }
  }

  initDiscover() {
    const thisMusicService = this;
    const discoverPlaylist = document.querySelector('.discover-playlist-wrapper');

    fetch(thisMusicService.appUrl)
      .then(response => response.json())
      .then(appData => {
        const playedSongs = appData.songs.filter(song => song.ranking > 0);
        const discoverInstance = new Discover(playedSongs, discoverPlaylist);
        discoverInstance.renderRandomSong(); 
      });
  }
}
class Discover {
  constructor(playedSongs, playlistWrapper) {
    this.playlistWrapper = playlistWrapper;
    this.playedSongs = playedSongs;
    this.currentSongIndex = 0;
  }

  createAudioElement(song) {
    const audioElement = document.createElement('audio');
    audioElement.src = `songs/${song.filename}`;
    return audioElement;
  }

  renderRandomSong() {
    if (this.playedSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.playedSongs.length);
      const randomSong = this.playedSongs[randomIndex];

      const containerOfSong = document.createElement('div');
      containerOfSong.classList.add('discover-song');
      containerOfSong.setAttribute('data-id', randomSong.id);

      const audioElement = this.createAudioElement(randomSong);
      containerOfSong.appendChild(audioElement);

      this.playlistWrapper.innerHTML = ''; 
      this.playlistWrapper.appendChild(containerOfSong);

      GreenAudioPlayer.init({
        selector: '.discover-song',
        stopOthersOnPlay: true,
      });
    } 
  }
}

new MusicServiceApp();
