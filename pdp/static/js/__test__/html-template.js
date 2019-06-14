module.exports = function () {
    // Return a fresh, unmolested one every time.
    // Copied from pdp/templates/map.html
    return [
        '<div id="wrapper">',
        '   <div id="header">',
        '      <a href="http://pacificclimate.org"><img src="${app_root}/images/banner.png" alt="PCIC Logo" /></a>',
        '      <h1>${title}</h1>',
        '      <div style="clear"></div>',
        '      <div id="topnav">',
        '        <ul class="menu">',
        '          <li><a href="http://pacificclimate.org">PCIC Home</a></li>',
        '          <li><a href="${app_root}/docs/" target="_blank">User Docs</a></li>',
        '        </ul>',
        '      <div id="login-div" style="visibility:hidden"></div>',
        '      </div><!-- /topnav -->',
        '    </div><!-- /header -->',
        '    <div id="main">',
        '      <div id="map-wrapper">',
        '        <div class="relative">',
        '          <div id="pdp-map" style="width: 100%; height: 100%"></div>',
        '          <div id="map-title"></div>',
        '          <div id="location"></div>',
        '          <div id="pdpColorbar"></div>',
        '        </div>',
        '      </div>',
        '      <div id="pdp-controls"></div>',
        '   </div><!-- /main -->',
        '   <div id="footer">',
        '        <ul class="menu">',
        '          <li>PCIC Data Portal version ${version} (${revision})</li>',
        '          <li><a href="http://www.pacificclimate.org/terms-of-use/">Terms of Use</a></li>',
        '        </ul>',
        '     </div><!-- /footer -->',
        '</div><!-- /wrapper -->'
    ].join();
};