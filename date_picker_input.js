(function($){
  
  function DatePickerInput(input, options) {
    this.$input = $(input);
    this.calendarContainer = null;
    this.calendarShown = false;

    $.extend(this, DatePickerInput.DEFAULT_OPTIONS, options);
  
    this.init();
  }
  
  DatePickerInput.DEFAULT_OPTIONS = {
    dateFormat: '%Y-%m-%d',
    readOnly: true
  };
  
  DatePickerInput.prototype = {
    init: function() {
      var cc = this;
      
      this.calendarContainer = $("<div class='calendar-container' />");
      
      $('body').append(this.calendarContainer)
      this.$input.focus(this, this.inputDidFocus)
                 .change(this, this.inputDidChange);
                 
      if (this.readOnly) {
        this.$input.attr('readonly', 'readonly')
                   .addClass('datepicker-readonly')
                   .click(this, this.inputDidFocus);
      }
      
      this.monthCalendar = this.calendarContainer.hide().monthCalendar({
        selected: function(date) {
          cc.$input.val(cc.formatDate(date)).change();  
        }
      })[0];
      
      this.$input.change();
    },

    showCalendar: function() {
      var offset = this.$input.offset(),
          top = offset.top + this.$input.outerHeight(),
          left = offset.left;

      this.calendarContainer.show()
        .css({
          position: 'absolute',
          top: top, left: left
        });
      
      $([window, document.body]).click(this, this.outsideWasClicked);
      $(document.body).keydown(this, this.keyWasPressed);
    },
        
    hideCalendar: function() {
      this.calendarContainer.hide();
      $([window, document.body]).unbind('click', this.outsideWasClicked);
      $(document.body).unbind('keydown', this.keyWasPressed);
    },
    
    formatDate: function(date) {
      var str = this.dateFormat.replace('%y', date.getYear())
                               .replace('%Y', date.getFullYear())
                               .replace('%m', date.getMonth() + 1)
                               .replace('%d', date.getDate());
      return str;
    },
    
    
    parseDate: function(stringDate) {
      var options = [ ['%y', '\\d{2}', 'Year'],
                      ['%Y', '\\d{4}', 'FullYear'],
                      ['%m', '\\d{1,2}', 'Month'],
                      ['%d', '\\d{1,2}', 'Date'] ]
      var i, j, result = new Date();

      for (i = 0; i < options.length; i++) {
        var pattern = this.dateFormat.replace(options[i][0], "(" + options[i][1] + ")");
        
        for (j = 0; j < options.length; j++) {
          if (j != i) {
            pattern = pattern.replace(options[j][0], options[j][1]);
          }
        }

        var regexp = new RegExp(pattern);
        var tokens = stringDate.match(regexp);
        
        if (tokens && tokens[1]) {
          var method = "set" + options[i][2];
          if (options[i][2] == 'Month') {
            tokens[1] -= 1;
          }
          result[method](tokens[1]);
        }
      }

      return result;
    },

    wasClickInsideCalendar: function(evt) {
      var offset = this.calendarContainer.position();
      offset.right = offset.left + this.calendarContainer.outerWidth();
      offset.bottom = offset.top + this.calendarContainer.outerHeight();

      return evt.pageY < offset.bottom &&
             evt.pageY > offset.top &&
             evt.pageX < offset.right &&
             evt.pageX > offset.left;
    },


    //
    // Event handlers:
    
    inputDidFocus: function(evt) {
      evt.data.showCalendar();
    },

    outsideWasClicked: function(evt) {
      var datePickerInput = evt.data;
      if (evt.target != datePickerInput.$input[0] && 
          !datePickerInput.wasClickInsideCalendar(evt)) {
        datePickerInput.hideCalendar();
      }
    },
    
    keyWasPressed: function(evt) {
      var datePickerInput = evt.data;
      switch (evt.keyCode)
      {
        case 9:
        case 27:
          datePickerInput.hideCalendar();
          return;
        default:
          return;
      }
      evt.preventDefault();
    },

    inputDidChange: function(evt) {
      var val = $(this).val(),
          datePickerInput = evt.data,
          date = datePickerInput.parseDate(val);

      datePickerInput.monthCalendar.select(date);
    }
  };
  
  
  $.fn.datePickerInput = function(options) {
    return this.each(function() {
      return new DatePickerInput(this, options);
    });
  };
  
})(jQuery);

