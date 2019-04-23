var classes = require('../classes');


// A: a base class
function A(name) {
    classes.classCallCheck(this, A);
    this.name = name;
}
classes.addClassProperties(A, {
    speak: function() {
        return 'I am ' + this.name;
    }
}, {
    aStatic: 42
});


// B: a subclass of A
function B() {
    classes.classCallCheck(this, B);
    // Invoke superclass constructor
    A.apply(this, arguments);
}
classes.inherit(B, A);
classes.addClassProperties(B, {
    speak: function() {
        return 'I am ' + this.name + '!!!';
    }
}, {
    bStatic: 'you bet'
});


describe('A', function() {
    it('throws an error if called without new', function() {
        expect(function() { A(); }).toThrow();
    });

    it('has its own static prop', function() {
        expect(A.aStatic).toBe(42);
    });

    describe('instance', function() {
        var a = new A('Groot');

        it('has a name', function() {
            expect(a.name).toBe('Groot');
        });

        it('speaks (prototype)', function() {
            expect(a.speak()).toBe('I am Groot');
        });

        it('does not access the static prop', function() {
            expect(a.aStatic).toBeUndefined();
        });
    });
});


describe('B', function() {
    it('throws an error if called without new', function() {
        expect(function() { B(); }).toThrow();
    });

    it('has its own static prop', function() {
        expect(B.bStatic).toBe('you bet');
    });

    it("doesn't have A'c static prop", function() {
        expect(B.aStatic).toBeUndefined();
    });

    describe('instance', function() {
        var b = new B('Groot');

        it('has a name', function() {
            expect(b.name).toBe('Groot');
        });

        it('speaks (prototype)', function() {
            expect(b.speak()).toBe('I am Groot!!!');
        });
    });
});


////////////

// In a prototype method that is (called as) a constructor,
// `this` refers to the object being constructed, and not to
// the containing object.

function C(x) {
    this.x = x;
}
classes.addClassProperties(C, {
    f: function() {
        return this;
    },

    D: function(y) {
        this.y = y;
    }
});


describe('C', function () {
    var c = new C(1);
    var d = new c.D(2);

    it('c.f', function () {
        console.log('c.f() =', c.f())
    });

    it('c, d', function () {
        console.log('c =', c);
        console.log('d =', d);
    });
});



function E(x) {
    this.x = x;
}

function F(e, y) {
    this.e = e;
    this.y = y;
}

classes.addClassProperties(E, {
    F: function(y) {
        F.call(this, this, y);  // this can't work; this === constructed object
    },

    f: function(y) {
        return new F(this, y);
    }
});



describe('E, F', function () {
    var e = new E(1);
    var eF = new e.F(2);
    var ef = e.f(2);

    it('stuff', function () {
        console.log('e =', e);
        console.log('eF =', eF);
        console.log('ef =', ef);

    });
});
