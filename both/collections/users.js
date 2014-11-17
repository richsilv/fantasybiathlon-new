var athleteRegex = new RegExp('^BT[A-Z]{3}$[0-9]{11}$'),
    teamArray = {
    type: [athleteRegex],
    maxCount: 4,
    defaultValue: []   
};

Schemas.UserTeam = new SimpleSchema({
    current: teamArray,
    teamHistory: {
        type: [Object],
        defaultValue: []
    },
    'teamHistory.$.team': {
        type: [athleteRegex],
        maxCount: 4,
        minCount: 4
    },
    'teamHistory.$.startDate': {
        type: Date,
        autoValue: function() {
            return new Date();
        }
    },
    'teamHistory.$.EndDate': {
        type: Date,
        optional: true
    }
});

Schemas.UserProfile = new SimpleSchema({
    name: {
        type: String,
        regEx: /^[a-zA-Z- ]{2,25}$/,
        optional: true
    },
    country: {
        type: /^[A-Z]{3}$/,
        defaultValue: 'GBR'
    },
    team: {
        type: Schemas.UserTeam
    },
    admin: {
        type: Boolean,
        defaultValue: false
    }
});

Schemas.User = new SimpleSchema({
    registered_emails: {
        type: [Object],
        optional: true
    },
    "registered_emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "registered_emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date,
        autoValue: function() {
            if (this.isInsert) {
                return new Date;
            } else if (this.isUpsert) {
                return {
                    $setOnInsert: new Date
                };
            } else {
                this.unset();
            }
        }
    },
    profile: {
        type: Schemas.UserProfile,
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    }
});

Meteor.users.attachSchema(Schemas.User);