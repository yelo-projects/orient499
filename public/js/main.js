var _gaq = _gaq || [];

jQuery(function($){

	/** google analytics  -- start ** /
	
	_gaq.push(['_setAccount', 'UA-42967251-1']);
	(function(){
		var ga = document.createElement('script');
		ga.type = 'text/javascript';
		ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();

	/** google analytics  -- end **/


	$('body').addClass('js');

	var $w = $(window)
	,	$PagesContainer = $('#Pages')
	,	$Pages = $('.page').removeClass('active')
	,	$PagesLinks = $('#Header a')
	,	$galleriesContainers = $('.gallery')
	,	$Galleries = $('.gallery-images')
	,	$Images = $('.gallery-image').removeClass('active')
	,	$toLoad = $('.gallery-image img')
	,	elCache = {}
	,	maxLoad = 3
	,	currLoad = 0
	;

	function getEl(el){
		if(!elCache.hasOwnProperty(el)){
			elCache[el] = $(el);
			if(!elCache[el].length){elCache[el] = false;}
		}
		return elCache[el];
	}

	function inView(){
		$toLoad.not('processed').filter(function(){
			var $e = $(this)
			, th = 0
			, wt = $w.scrollTop()
			, wb = wt + $w.height()
			, et = $e.offset().top
			, eb = et + $e.height()
			;
			return eb >= wt - th && et <= wb + th;
		}).each(function(){
			lazyLoadImage($(this));
		})
	}

	function lazyLoadImage($image,galleryId,imageId,loadInc){
		if(!loadInc){loadInc=0;}
		var $imageContainer = $image.parent().parent()
		if($image.hasClass('processed')){
			if($image.hasClass('loaded')){
				$imageContainer.addClass('active');
			}
			return;
		}
		currLoad+=1-loadInc;
		$image
			.on('load',function(){
				currLoad--;
				$imageContainer.addClass('active');
				$image.addClass('loaded').off('load');
				$toLoad = $toLoad.not($image);
				if(!galleryId){return;}
				if(currLoad < maxLoad){
					var $next = $(galleryId + '-image-' + imageId);
					if($next.length){lazyLoadImage($next);}
				}
			})
			.addClass('processed')
			.attr('src',$image.data('src'));
		return $image;
	}

	function route(hash){
		hash = (hash || '#home').split('-image-');
		var pageId = hash.shift()
		,	imageId = (hash.shift() || '0')
		,	page = pageId+'-page'
		,	image = pageId+'-image-' + imageId
		,	link = pageId+'-link'
		,	$page = getEl(page)
		,	$image = getEl(image)
		,	$link = getEl(link)
		;
		$Images.removeClass('active');
		lazyLoadImage($image,pageId,imageId);
		$Pages.not($page.addClass('active')).removeClass('active');
		$PagesLinks.not($link.addClass('active')).removeClass('active');
		if(pageId=='#contactus'){
			lazyLoadImage($('#contactus-page .gallery-image-1 img'),pageId,imageId,1);
		}
		_gaq.push(['_trackPageview', location.pathname + location.search  + location.hash]);
	}

	$("a[href^=#]").on("click", function(evt){
		evt.preventDefault();
		var hash = '#'+this.href.split('#').pop()
		route(hash);
		history.pushState({}, "", hash);
	});

	$w.on('hashchange',function(){route(location.hash);})

	route(location.hash || null);

})