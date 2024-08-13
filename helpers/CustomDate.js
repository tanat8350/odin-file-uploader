class CustomDate extends Date {
  constructor() {
    super(new Date());
  }
  addDays(days) {
    this.setDate(this.getDate() + days);
    return this;
  }
}

module.exports = CustomDate;
