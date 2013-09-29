var myStepDefinitionsWrapper = function () {

  this.Given(/^I am on the Cucumber.js Github repository$/, function(callback) {
    callback();
  });

  this.When(/^I go to the README file$/, function(callback) {
    callback.pending();
  });

  this.Then(/^I should see "(.*)" as the page title$/, function(title, callback) {
    // matching groups are passed as parameters to the step definition

    if (!this.isOnPageWithTitle(title))
      // You can make steps fail by calling the `fail()` function on the callback:
      callback.fail(new Error("Expected to be on page with title " + title));
    else
      callback();
  });
};

module.exports = myStepDefinitionsWrapper;
