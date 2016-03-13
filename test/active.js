casper.options.viewportSize = {width: 1920, height: 1080};

casper.test.begin('Active', 3, function suite(test) {
    casper.start("http://localhost:9000/id/automatedtesting", function() {
      casper.waitForResource('steambg.png', function() {

        test.assertEquals(this.getElementAttribute('body', 'data-ingame'), 'true', 'Recognized as ingame')
        test.assertEquals(this.fetchText('.mdl-layout-title .appName'), 'Dota 2', 'Currently playing Dota 2');
        test.assertEval(function() {
            return __utils__.findAll(".links > a").length >= 3;
        }, 'Loaded at least 3 GameLinks');


        this.capture('active.png')

      });
    });

    casper.run(function() {
        test.done();
    });
});
