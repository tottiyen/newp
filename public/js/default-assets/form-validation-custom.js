! function (e) {
    "use strict";
    e.validator.setDefaults({
        submitHandler: function () {
            alert("submitted!")
        }
    }), e(function () {
        e("#commentForm").validate({
            errorPlacement: function (e, a) {
                e.addClass("mt-2 text-danger"), e.insertAfter(a)
            },
            highlight: function (a, s) {
                e(a).parent().addClass("has-danger"), e(a).addClass("form-control-danger")
            }
        }), e("#signupForm").validate({
            rules: {
                firstname: "required",
                lastname: "required",
                username: {
                    required: !0,
                    minlength: 2
                },
                password: {
                    required: !0,
                    minlength: 5
                },
                confirm_password: {
                    required: !0,
                    minlength: 5,
                    equalTo: "#password"
                },
                email: {
                    required: !0,
                    email: !0
                },
                topic: {
                    required: "#newsletter:checked",
                    minlength: 2
                },
                agree: "required"
            },
            messages: {
                firstname: "Please enter your firstname",
                lastname: "Please enter your lastname",
                username: {
                    required: "Please enter a username",
                    minlength: "Your username must consist of at least 2 characters"
                },
                password: {
                    required: "Please provide a password",
                    minlength: "Your password must be at least 5 characters long"
                },
                confirm_password: {
                    required: "Please provide a password",
                    minlength: "Your password must be at least 5 characters long",
                    equalTo: "Please enter the same password as above"
                },
                email: "Please enter a valid email address",
                agree: "Please accept our policy",
                topic: "Please select at least 2 topics"
            },
            errorPlacement: function (e, a) {
                e.addClass("mt-2 text-danger"), e.insertAfter(a)
            },
            highlight: function (a, s) {
                e(a).parent().addClass("has-danger"), e(a).addClass("form-control-danger")
            }
        }), e("#username").focus(function () {
            var a = e("#firstname").val(),
                s = e("#lastname").val();
            a && s && !this.value && (this.value = a + "." + s)
        });
        var a = e("#newsletter"),
            s = a.is(":checked"),
            r = e("#newsletter_topics")[s ? "removeClass" : "addClass"]("gray"),
            t = r.find("input").attr("disabled", !s);
        a.on("click", function () {
            r[this.checked ? "removeClass" : "addClass"]("gray"), t.attr("disabled", !this.checked)
        })
    })
}(jQuery);