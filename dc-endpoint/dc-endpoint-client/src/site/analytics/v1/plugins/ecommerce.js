/**
 * Created by vison on 2016/5/7.
 */
function EcommercePlugin() {
    var _this = this;

    /**
     * plugin publish interface
     * @param eventName
     * @param args
     */
    _this.triggerEvent = function(eventName,args) {

        if (eventName == 'addTransaction') {

            _addTransaction();
        }

        else if (eventName == 'addItem') {

        }
        else if (eventName == 'clear') {

        }
        else if (eventName == 'send') {

        }

    };


    // ================ private method defined =========================
    /**
     * method handle
     * @private
     */
    function _addTransaction () {
        console.log('hello workd');
    }

    /**
     *
     * @private
     */
    function _addItem() {

    }

    function _clear() {

    }

    function _send() {

    }



}
TrackerManager.register('ecommerce' , EcommercePlugin);
