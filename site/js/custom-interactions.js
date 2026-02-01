(function () {
  'use strict';

  function domReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupSpeakerHover() {
    var cards = document.querySelectorAll('.speaker-card');
    cards.forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        card.classList.add('is-hover');
      });
      card.addEventListener('mouseleave', function () {
        card.classList.remove('is-hover');
      });
      card.addEventListener('focusin', function () {
        card.classList.add('is-hover');
      });
      card.addEventListener('focusout', function (event) {
        if (!card.contains(event.relatedTarget)) {
          card.classList.remove('is-hover');
        }
      });
      card.addEventListener('touchstart', function () {
        card.classList.add('is-hover');
      }, { passive: true });
    });
  }

  function normalizeSpeakerSlider(slider) {
    if (!slider) return;

    var track = slider.querySelector('.slick-track');
    if (track) {
      var slides = Array.prototype.slice.call(track.children);
      slider.innerHTML = '';
      slides.forEach(function (slide) {
        slide.classList.remove(
          'slick-slide',
          'slick-current',
          'slick-active',
          'slick-center',
          'slick-visible'
        );
        slide.removeAttribute('data-slick-index');
        slide.removeAttribute('aria-hidden');
        slide.removeAttribute('style');
        slider.appendChild(slide);
      });
    }

    slider.classList.remove('slick-initialized', 'slick-slider', 'slick-dotted');
  }

  function initSpeakerSlider() {
    if (!window.jQuery || !window.jQuery.fn || !window.jQuery.fn.slick) {
      bindSliderNav(null);
      return;
    }

    var $ = window.jQuery;
    var $slider = $('.speaker-slider');
    if (!$slider.length) return;

    try {
      if ($slider.data('slick')) {
        $slider.slick('unslick');
      }
    } catch (err) {
      // ignore
    }

    normalizeSpeakerSlider($slider.get(0));

    $slider.slick({
      arrows: false,
      infinite: false,
      autoplay: false,
      autoplaySpeed: 8000,
      speed: 300,
      slidesToShow: 3,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: 2
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1
          }
        }
      ]
    });

    bindSliderNav($slider.get(0));
  }

  function bindSliderNav(sliderEl) {
    var navs = document.querySelectorAll('.speaker-slider_nav');
    if (!navs.length) return;

    function slideBy(delta) {
      if (sliderEl && window.jQuery && window.jQuery.fn && window.jQuery.fn.slick) {
        var $slider = window.jQuery(sliderEl);
        if ($slider.hasClass('slick-initialized')) {
          $slider.slick(delta > 0 ? 'slickNext' : 'slickPrev');
          return;
        }
      }

      var fallbackSlider = sliderEl || document.querySelector('.speaker-slider');
      if (!fallbackSlider) return;
      var scroller = fallbackSlider.querySelector('.slick-list') || fallbackSlider;
      if (scroller && typeof scroller.scrollBy === 'function') {
        var amount = (scroller.clientWidth || 320) * 0.9 * delta;
        scroller.scrollBy({ left: amount, behavior: 'smooth' });
      }
    }

    navs.forEach(function (nav) {
      if (nav.dataset.sliderBound) return;
      nav.dataset.sliderBound = 'true';

      var buttons = nav.querySelectorAll('a, button');
      if (!buttons.length) return;

      var prev = nav.querySelector('#speaker-slide-left') || buttons[0];
      var next = nav.querySelector('#speaker-slide-right') || buttons[buttons.length - 1];

      if (prev) {
        prev.addEventListener('click', function (event) {
          event.preventDefault();
          slideBy(-1);
        });
      }
      if (next) {
        next.addEventListener('click', function (event) {
          event.preventDefault();
          slideBy(1);
        });
      }
    });
  }

  function setupAccordion() {
    var items = document.querySelectorAll('.accordion-item');
    if (!items.length) return;

    function openItem(item) {
      var trigger = item.querySelector('.accordion-trigger');
      var content = item.querySelector('.accordion-content');
      if (!trigger || !content) return;

      item.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      content.setAttribute('aria-hidden', 'false');
      content.style.display = 'block';

      if (content.style.height === 'auto') {
        content.style.height = content.scrollHeight + 'px';
      } else {
        content.style.height = content.scrollHeight + 'px';
      }
    }

    function closeItem(item) {
      var trigger = item.querySelector('.accordion-trigger');
      var content = item.querySelector('.accordion-content');
      if (!trigger || !content) return;

      item.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
      content.setAttribute('aria-hidden', 'true');
      content.style.display = 'block';

      if (content.style.height === 'auto') {
        content.style.height = content.scrollHeight + 'px';
      }

      requestAnimationFrame(function () {
        content.style.height = '0px';
      });
    }

    function toggleItem(item) {
      if (item.classList.contains('is-open')) {
        closeItem(item);
      } else {
        openItem(item);
      }
    }

    items.forEach(function (item) {
      var trigger = item.querySelector('.accordion-trigger');
      var content = item.querySelector('.accordion-content');
      var iconLeft = item.querySelector('.accordion-icon_left');
      var iconRight = item.querySelector('.accordion-icon_right');
      if (!trigger || !content) return;

      content.style.display = 'block';
      content.style.height = '0px';
      content.style.overflow = 'hidden';
      trigger.setAttribute('aria-expanded', 'false');
      content.setAttribute('aria-hidden', 'true');
      if (iconLeft) iconLeft.style.transform = 'rotate(0deg)';
      if (iconRight) iconRight.style.transform = 'rotate(0deg)';

      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        toggleItem(item);
      });

      trigger.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggleItem(item);
        }
      });

      content.addEventListener('transitionend', function () {
        if (item.classList.contains('is-open')) {
          content.style.height = 'auto';
        }
      });
    });

    function updateOpenHeights() {
      items.forEach(function (item) {
        if (!item.classList.contains('is-open')) return;
        var content = item.querySelector('.accordion-content');
        if (!content) return;
        content.style.height = 'auto';
        var height = content.scrollHeight;
        content.style.height = height + 'px';
      });
    }

    window.addEventListener('resize', updateOpenHeights);
    window.addEventListener('load', updateOpenHeights);
  }

  domReady(function () {
    setupSpeakerHover();
    setupAccordion();
    initSpeakerSlider();
  });
})();
