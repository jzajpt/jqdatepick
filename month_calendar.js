(function($){

  $.extend(Date.prototype, {
    daysInCurrentMonth: function() {
      var year = this.getFullYear(),
          month = this.getMonth();
      return 32 - new Date(year, month, 32).getDate();
    },

    incrementDay: function() {
      this.setDate(this.getDate() + 1);
    },

    incrementMonth: function() {
      this.setMonth(this.getMonth() + 1);
    },

    decrementMonth: function() {
      this.setMonth(this.getMonth() - 1);
    },

    compareDate: function(other) {
      var d1 = [this.getFullYear, this.getMonth(), this.getDate()].join('-'),
          d2 = [other.getFullYear, other.getMonth(), other.getDate()].join('-');
      return d1 == d2;
    }
  });


  function MonthlyCalendar(container, options) {
    var today = new Date();

    this.options = options;

    this.$container = $(container);

    this.selectedDate = null;

    this.beginFrom = new Date();
    this.beginFrom.setDate(1);

    this.firstDayOfWeek = 1;
    this.lastDayOfWeek = this.firstDayOfWeek - 1;
    if (this.lastDayOfWeek < 0) this.lastDayOfWeek = 6 - this.lastDayOfWeek;

    this.init();
  }

  var monthNames = "Leden Únor Březen Duben Květen Červen Červenec Srpen Září Říjen Listopad Prosinec".split(' ');
  var weekdayNames = "Po Út St Čt Pá So Ne".split(' ');

  MonthlyCalendar.prototype = {
    init: function() {
      var calendar = $("<div class='month-calendar' />"),
          title = this.constructTitle(),
          header = this.constructHeader(),
          body = this.constructBody();

      calendar.append(title)
              .append(header)
              .append(body);

      this.$container.append(calendar);
    },

    reinit: function() {
      this.destroy();
      this.init();
    },

    destroy: function() {
      this.$container.children().remove();
    },

    select: function(date) {
      var stringDate = this._formatDate(date),
          beginFrom = new Date(date.valueOf());

      beginFrom.setDate(1);
      this.beginFrom = beginFrom;

      this.reinit();

      this.selectedDate = date;
      this.$container.find('.date-' + stringDate).addClass('selected');
    },

    constructTitle: function() {
      var title = $("<div class='title' />"),
          previousMonth = $("<div class='button previous' />").text('←'),
          nextMonth = $("<div class='button next' />").text('→'),
          monthName = monthNames[this.beginFrom.getMonth()],
          year = this.beginFrom.getFullYear(),
          headline = $("<div class='headline' />").text(monthName + ' ' + year);

      previousMonth.click(this, this.showPreviousMonth);
      nextMonth.click(this, this.showNextMonth);

      title.append(previousMonth)
           .append(headline)
           .append(nextMonth);

      return title;
    },

    constructHeader: function() {
      var i, header = $("<div class='header' />");

      for (i=0; i<7; i++) {
        var day = $("<div class='day' />").text(weekdayNames[i]);
        header.append(day);
      }

      return header;
    },

    constructBody: function() {
      var body = $("<div class='body' />"),
          today = new Date();

      this._forEachDay(function(currentDate) {
        var dayInMonth = currentDate.getDate(),
            formattedDate = this._formatDate(currentDate),
            dateClass = "date-" + formattedDate,
            day = $("<div class='day' />").text(dayInMonth).data('date', formattedDate).addClass(dateClass);

        if (currentDate.getMonth() != this.beginFrom.getMonth()) {
          day.addClass('inactive');
        }
        if (currentDate.compareDate(today)) {
          day.addClass('today');
        }

        day.click(this, this.dateClicked);

        body.append(day);
      }, this);

      return body;
    },

    _forEachDay: function(callback, context) {
      var month = this.beginFrom.getMonth(),
          firstDay = new Date(this.beginFrom.valueOf()),
          lastDay = new Date(this.beginFrom.valueOf()),
          currentDate;

      // Calendar should start from first day of the week
      if (firstDay.getDay() != this.firstDayOfWeek) {
        var offset = firstDay.getDay() - this.firstDayOfWeek;
        if (offset < 0) offset = offset + 7;
        firstDay.setDate(firstDay.getDate() - offset);
      }

      // And end on last day of week
      lastDay.setDate(lastDay.daysInCurrentMonth());
      if (lastDay.getDay() != this.lastDayOfWeek) {
        var offset = this.lastDayOfWeek - lastDay.getDay();
        if (offset < 0) offset = offset + 7;
        lastDay.setDate(lastDay.getDate() + offset);
      }

      for (currentDate = new Date(firstDay.valueOf());
          currentDate <= lastDay;
          currentDate.incrementDay()) {
        if (callback) callback.call(context, currentDate);
      }
    },

    _formatDate: function(date) {
      return [date.getFullYear(), date.getMonth()+1, date.getDate()].join('-');
    },

    _parseDate: function(dateString) {
      if (dateString && dateString.match) {
        var tokens = dateString.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
        return new Date(tokens[1], tokens[2]-1, tokens[3]);
      } else {
        return null;
      }
    },


    //
    // Event handlers:

    showPreviousMonth: function(evt) {
      var calendar = evt.data,
          beginFrom = calendar.beginFrom;

      beginFrom.decrementMonth();
      calendar.reinit();

      if (calendar.options && calendar.options.previousMonth) {
        calendar.options.previousMonth(calendar.beginFrom);
      }
    },

    showNextMonth: function(evt) {
      var calendar = evt.data,
          beginFrom = calendar.beginFrom;

      beginFrom.incrementMonth();
      calendar.reinit();

      if (calendar.options && calendar.options.nextMonth) {
        calendar.options.nextMonth(calendar.beginFrom);
      }
    },

    dateClicked: function(evt) {
      var dayBox = $(this),
          calendar = evt.data,
          date = calendar._parseDate(dayBox.data('date'));

      calendar.$container.find('.selected').removeClass('selected');
      calendar.selectedDate = date;
      dayBox.addClass('selected');

      if (calendar.options && calendar.options.selected) {
        calendar.options.selected(calendar.selectedDate);
      }
    }
  };

  $.fn.monthCalendar = function(options) {
    return this.map(function() {
      return new MonthlyCalendar(this, options);
    });
  };

})(jQuery);
