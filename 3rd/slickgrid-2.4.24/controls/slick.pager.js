(function ($) {
  function SlickGridPager(dataView, grid, $container, options) {
    var $status;
    var _options;
    var _defaults = {
      showAllText: "Showing all {rowCount} rows",
      showPageText: "Showing page {pageNum} of {pageCount}"
    };
    
    function init() {
      _options = $.extend(true, {}, _defaults, options);
      
      dataView.onPagingInfoChanged.subscribe(function (e, pagingInfo) {
        updatePager(pagingInfo);
      });

      constructPagerUI();
      updatePager(dataView.getPagingInfo());
    }

    function getNavState() {
      var cannotLeaveEditMode = !Slick.GlobalEditorLock.commitCurrentEdit();
      var pagingInfo = dataView.getPagingInfo();
      var lastPage = pagingInfo.totalPages - 1;

      return {
        canGotoFirst: !cannotLeaveEditMode && pagingInfo.pageSize !== 0 && pagingInfo.pageNum > 0,
        canGotoLast: !cannotLeaveEditMode && pagingInfo.pageSize !== 0 && pagingInfo.pageNum !== lastPage,
        canGotoPrev: !cannotLeaveEditMode && pagingInfo.pageSize !== 0 && pagingInfo.pageNum > 0,
        canGotoNext: !cannotLeaveEditMode && pagingInfo.pageSize !== 0 && pagingInfo.pageNum < lastPage,
        pagingInfo: pagingInfo
      };
    }

    function setPageSize(n) {
      dataView.setRefreshHints({
        isFilterUnchanged: true
      });
      dataView.setPagingOptions({pageSize: n});
    }

    function gotoFirst() {
      if (getNavState().canGotoFirst) {
        dataView.setPagingOptions({pageNum: 0});
      }
    }

    function gotoLast() {
      var state = getNavState();
      if (state.canGotoLast) {
        dataView.setPagingOptions({pageNum: state.pagingInfo.totalPages - 1});
      }
    }

    function gotoPrev() {
      var state = getNavState();
      if (state.canGotoPrev) {
        dataView.setPagingOptions({pageNum: state.pagingInfo.pageNum - 1});
      }
    }

    function gotoNext() {
      var state = getNavState();
      if (state.canGotoNext) {
        dataView.setPagingOptions({pageNum: state.pagingInfo.pageNum + 1});
      }
    }

    function constructPagerUI() {
      $container.empty();

      var $nav = $("<span class='slick-pager-nav pull-right btn-group' />").appendTo($container);
      var $settings = $("<span class='slick-pager-settings' />").appendTo($container);
      $status = $("<span class='slick-pager-status' />").appendTo($container);

      $settings.append('<span class="slick-pager-settings-expanded btn-group">' +
        '<!--a class="text-info pointer font-16 mr-3 pt-2" data=0>所有</a-->' +
        '<a class="btn btn-sm btn-info text-white width-36 pointer font-16 pl-1 pr-1 " data=25>25</a>' +
        '<a class="btn btn-sm btn-info text-white width-36 pointer font-16 pl-1 pr-1" data=50>50</a>' +
        '<a class="btn btn-sm btn-info text-white width-36 toggled pointer font-16 pl-1 pr-1" data=100>100</a></span>');

      let defaultPageSize = 25;
      setPageSize(defaultPageSize);
      $settings.find("a[data]").click(function (e) {
        var pagesize = $(e.target).attr("data");
        if (pagesize !== undefined) {
          if (pagesize == -1) {
            var vp = grid.getViewport();
            setPageSize(vp.bottom - vp.top);
          } else {
            setPageSize(parseInt(pagesize));
          }
        }
      });

      var icon_prefix = "<span class='ui-state-default ui-corner-all ui-icon-container'><span class='ui-icon ";
      var icon_suffix = "'/></span>";

      // $(icon_prefix + "ui-icon-lightbulb" + icon_suffix).click(function () {
      //   $(".slick-pager-settings-expanded").toggle();
      // }).appendTo($settings);

      let linkFirst = $('<a class="btn btn-sm btn-info text-white width-36 pointer font-16 pl-1 pr-1 ">');
      let iconFirst = $('<i class="fas fa-angle-double-left"></i>');

      linkFirst.append(iconFirst);
      linkFirst.click(gotoFirst).appendTo($nav);

      let linkPrev = $('<a class="btn btn-sm btn-info text-white width-36 pointer font-16 pl-1 pr-1 ">');
      let iconPrev = $('<i class="fas fa-angle-left"></i>');

      linkPrev.append(iconPrev);
      linkPrev.click(gotoPrev).appendTo($nav);

      let linkNext = $('<a class="btn btn-sm btn-info text-white width-36 pointer font-16 pl-1 pr-1 ">');
      let iconNext = $('<i class="fas fa-angle-right"></i>');

      linkNext.append(iconNext);
      linkNext.click(gotoNext).appendTo($nav);

      let linkLast = $('<a class="btn btn-sm btn-info text-white width-36 pointer font-16 pl-1 pr-1 ">');
      let iconLast = $('<i class="fas fa-angle-double-right"></i>');

      linkLast.append(iconLast);
      linkLast.click(gotoLast).appendTo($nav);

      $container.find(".ui-icon-container")
          .hover(function () {
            $(this).toggleClass("ui-state-hover");
          });

      $container.children().wrapAll("<div class='slick-pager' />");
    }


    function updatePager(pagingInfo) {
      var state = getNavState();

      $container.find(".slick-pager-nav span").removeClass("ui-state-disabled");
      if (!state.canGotoFirst) {
        $container.find(".ui-icon-seek-first").addClass("ui-state-disabled");
      }
      if (!state.canGotoLast) {
        $container.find(".ui-icon-seek-end").addClass("ui-state-disabled");
      }
      if (!state.canGotoNext) {
        $container.find(".ui-icon-seek-next").addClass("ui-state-disabled");
      }
      if (!state.canGotoPrev) {
        $container.find(".ui-icon-seek-prev").addClass("ui-state-disabled");
      }

      if (pagingInfo.pageSize === 0) {
        // $status.text(_options.showAllText.replace('{rowCount}', pagingInfo.totalRows + "").replace('{pageCount}', pagingInfo.totalPages + ""));
      } else {
        // $status.text(_options.showPageText.replace('{pageNum}', pagingInfo.pageNum + 1 + "").replace('{pageCount}', pagingInfo.totalPages + ""));
      }
    }

    init();
  }

  // Slick.Controls.Pager
  $.extend(true, window, { Slick:{ Controls:{ Pager:SlickGridPager }}});
})(jQuery);
