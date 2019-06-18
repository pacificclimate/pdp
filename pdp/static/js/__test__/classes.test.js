require('./globals-helpers').importGlobals([
    { module: 'js/condExport', name: 'condExport' },
    { module: 'js/classes.js', name: 'classes' },
], '../..');


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
