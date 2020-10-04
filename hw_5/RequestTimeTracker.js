class RequestTimeTracker {
    constructor() {
        this._startTime = new Date();
        this._endTime;
        this._timeSpend;
    }

    getStartTime() {
        return this._startTime;
    }

    stop() {
        this._endTime = new Date();
    }

    getEndTime() {
        return this._endTime;
    }

    getSpendTime() {
        return ((this._endTime - this._startTime) / 1000).toFixed(3);
    }
}

exports.RequestTimeTracker = RequestTimeTracker;