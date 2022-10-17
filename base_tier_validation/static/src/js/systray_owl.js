/** @odoo-module **/

const { Component, useState } = owl;
import { registry } from "@web/core/registry";
import { session } from "@web/session";
import { useService } from "@web/core/utils/hooks";


export class ReviewMenuPreview extends Component {
    static template = "tier.validation.ReviewMenuPreview";
}


export class ReviewMenu extends Component {
    static template = "tier.validation.ReviewMenu";
    static components = { ReviewMenuPreview };

    setup() {
        this.orm = useService("orm");
        this.state = useState({ reviewCounter: 0, reviews: {} });

        // Don't know what this is supposed to do exactly
        // this.call("bus_service", "addChannel", channel);
        // this.call("bus_service", "startPolling");
        // this.call("bus_service", "onNotification", this, this._updateReviewPreview);
    }

    onClick() {
        this._getReviewData();
    }

    increment() {
        this.state.value++;
    }

    ///////////////////////


    /**
     * Make RPC and get current user's activity details
     * @private
     * @returns {integer}
     */
    _getReviewData() {
        var self = this;

        return self.orm.call(
                "res.users",
                "review_user_count",
                undefined,
                { context: session.user_context },
            )
            .then(function (data) {
                self.state.reviews = data;
                self.state.reviewCounter = _.reduce(
                    data,
                    function (total_count, p_data) {
                        return total_count + p_data.pending_count;
                    },
                    0
                );
            });
    }

    /**
     * Update counter based on activity status(created or Done)
     * @private
     * @param {Object} [data] key, value to decide activity created or deleted
     * @param {String} [data.type] notification type
     * @param {Boolean} [data.activity_deleted] when activity deleted
     * @param {Boolean} [data.activity_created] when activity created
     */
    _updateCounter (data) {
        if (!data) return
        if (data.review_created) {
            this.data.reviewCounter++;
        }
        if (data.review_deleted && this.data.reviewCounter > 0) {
            this.data.reviewCounter--;
        }
    }

}

registry.category("systray").add("tier.validation.ReviewMenu", {
    Component: ReviewMenu,
});
