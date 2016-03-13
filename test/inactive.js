casper.test.begin('Inactive', 2, function suite(test) {
    casper.start("http://localhost:9000/id/automatedtesting", function() {
      casper.waitForResource('steambg.png', function() {

        test.assertEquals(this.getElementAttribute('body', 'data-ingame'), 'false',  'Recognized as not in game')
        test.assertEquals(this.fetchText('.mdl-layout-title .appName'), '', 'Did not load game data');

      });
    });

    casper.run(function() {
        test.done();
    });
});
