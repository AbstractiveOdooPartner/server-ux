/** @odoo-module **/

const { Component, useState, useRef, onWillDestroy } = owl;
import { registry } from "@web/core/registry";
import { session } from "@web/session";
import { useService } from "@web/core/utils/hooks";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";


export class ReviewMenu extends Component {
    static template = "tier.validation.ReviewMenu";
    static components = { Dropdown, DropdownItem };

    setup() {
        this.orm = useService("orm");
        this.state = useState({ isOpen: false, reviewCounter: 0, reviews: {} });
        this.rootRef = useRef('root');

        // Don't know what this is supposed to do exactly
        // this.call("bus_service", "addChannel", channel);
        // this.call("bus_service", "startPolling");
        // this.call("bus_service", "onNotification", this, this._updateReviewPreview);

        document.addEventListener('click', this.onClickCaptureGlobal.bind(this), true);
        onWillDestroy(() => {
            document.removeEventListener('click', this.onClickCaptureGlobal.bind(this), true);
        });
    }

    onClickToggler(ev) {
        this._getReviewData();
        this.state.isOpen = !this.state.isOpen;
    }

    onClickCaptureGlobal(ev) {
        if (!this.rootRef.el || this.rootRef.el.contains(ev.target)) {
            return;
        }
        this.state.isOpen = false;
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
