var athleteRegex = new RegExp('^BT[A-Z]{3}$[0-9]{11}$'),
    teamArray = {
        type: [athleteRegex],
        maxCount: 4,
        defaultValue: []
    };

Meteor.users._transform = function(user) {
    user.profile && user.profile.team && (user.profile.team.members = new FantasyTeam(user.profile.team.current));
    return user;
}

Schemas.UserTeam = new SimpleSchema({
    name: {
        type: String,
        defaultValue: 'My Team',
        min: 1,
        max: 25
    },
    current: teamArray,
    transfers: {
        type: Number,
        min: 0,
        max: 4,
        defaultValue: 2
    },
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
    'teamHistory.$.endDate': {
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

Meteor.users.allow({
    insert: function(userId, doc) {
        return false;
    },

    update: function(userId, doc, fieldNames, modifier) {
        var allowFields = ['profile.team.name', 'profile.team.nation']

        if (userId !== doc._id) return false;
        if (_.difference(fieldNames, allowFields).length) return false;
        return true;
    },

    remove: function(userId, doc) {
        return userId === doc._id;
    }
});

Meteor.users.deny({
    insert: function(userId, doc) {
        return false;
    },

    update: function(userId, doc, fieldNames, modifier) {
        return false;
    },

    remove: function(userId, doc) {
        return false;
    }
});