var Bug, Shield, Human;

function createBugs() {
    var j, results;
    results = [];
    for (i = j = 0; j < 600; i = ++j) {
        results.push(new Bug(0, random(this.height)));
    }
    return results;
}

Bug = (function () {
    function Bug(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = 1;
        this.spurt = 0.5;
        this.color = '#fff';
        this.hasTarget = false;
        this.dead = false;
        this;
    }

    Bug.prototype.update = function (ctx, index, ndt) {
        var closestTarget, dist, dx, dy, shield, i, lowestDist, target;
        this.hasTarget = false;
        if (ctx.shield.length) {
            lowestDist = 999999;
            closestTarget = null;
            i = ctx.shield.length;
            while (i--) {
                shield = ctx.shield[i];
                dx = this.x - shield.x;
                dy = this.y - shield.y;
                dist = sqrt(dx * dx + dy * dy);
                if (dist < lowestDist) {
                    lowestDist = dist;
                    closestTarget = i;
                }
            }
            target = ctx.shield[closestTarget];
            dx = this.x - target.x;
            dy = this.y - target.y;
            dist = sqrt(dx * dx + dy * dy);
            if (dist < target.threshold + target.radius && target.active) {
                this.hasTarget = true;
                // if (dist < target.radius * (target.life / target.radius) + 5) {
                //     target.life -= 0.004;
                // }
            }
        }
        if (this.hasTarget) {
            this.vx += (random(-0.2, 0.2)) * this.spurt;
            this.vy += (random(-0.2, 0.2)) * this.spurt;
            this.vx -= dx / 500;
            this.vy -= dy / 500;
        } else {
            this.vx += (random(-0.2, 0.5)) * this.spurt;
            this.vy += (random(-0.2, 0.2)) * this.spurt;
        }
        this.x += this.vx * ndt;
        this.y += this.vy * ndt;
        this.vx *= 0.95;
        this.vy *= 0.95;
        if ((this.vx < 0.1 && this.x > ctx.width * 0.1) || this.x > ctx.width * 0.99) {
            this.dead = true;;
        }
        if (this.spurt > 0.5) {
            this.spurt -= 0.1;
        }
        if (this.spurt <= 0.5 && !floor(random(1000))) {
            return this.spurt = random(1, 4);
        }
    };

    // Bug.prototype.wrap = function (ctx) {
    //     if (!this.hasTarget) {
    //         if (this.x > ctx.width + this.radius) {
    //             this.x = -this.radius;
    //         } else if (this.x < -this.radius) {
    //             this.x = ctx.width + this.radius;
    //         }
    //         if (this.y > ctx.height + this.radius) {
    //             return this.y = -this.radius;
    //         } else if (this.y < -this.radius) {
    //             return this.y = ctx.height + this.radius;
    //         }
    //     }
    // };

    return Bug;

})();

Human = (function () {
    function Human(x, y) {
        this.x = x;
        this.vy = 0;
        this.y = y;
        this.radius = 5;
        this.infected = false
        this;
    }

    Human.prototype.update = function (ctx, index, ndt) {
        if (ctx.bugs.length) {
            i = ctx.bugs.length;
            while (i--) {
                bug = ctx.bugs[i];
                if (!bug.dead && bug.x >= (0.90 * ctx.width)) {
                    dx = this.x - bug.x;
                    dy = this.y - bug.y;
                    dist = sqrt(dx * dx + dy * dy);
                    if (dist <= this.radius) {
                        if (!this.infected) {
                            this.infected = true;
                            bug.dead = true;
                        }
                    }
                }
            }
            this.vy += (random(-0.05, 0.05));
            this.y += this.vy * ndt;
            if (this.y < 0) {
                this.y = ctx.height - this.radius;
            }
            else if (this.y > ctx.height) {
                this.y = 0 + this.radius;
            }
        }
    };

    return Human;

})();

Shield = (function () {
    function Shield(x, y) {
        this.x = x;
        this.y = y;
        this.growthRadius = 0.0001;
        this.radius = random(30, 50);
        this.life = this.radius;
        this.threshold = 50;
        this.active = false;
        this;
    }

    Shield.prototype.update = function (ctx, index, ndt) {
        if (!this.active) {
            this.growthRadius += 1.5;
            if (this.growthRadius >= this.radius) {
                this.active = true;
            }
        }
        if (this.active) {
            this.life -= 0.4;
        }
        if (this.life <= 0) {
            return ctx.shield.splice(index, 1);
        }
    };

    return Shield;

})();

$(document).ready(() => {
    Sketch.create({
        fullscreen : false,
        width: 1200,
        height: 600,
        setup: function () {
            var i;
            this.tick = 0;
            this.mouse.x = this.width / 2;
            this.mouse.y = this.height / 2;
            this.waveCount = 1;
            this.finalMessage = "";
            this.shield = (function () {
                var j, results;
                results = [];
                // for (i = j = 0; j <= 0; i = ++j) {
                //     results.push(new Shield(random(this.width), random(this.height)));
                // }
                return results;
            }).call(this);
            this.humans = (function () {
                var j, results;
                results = [];
                for (i = j = 0; j < 200; i = ++j) {
                    results.push(new Human(random(0.9 * this.width, this.width - 20), random(this.height)));
                }
                return results;
            }).call(this);
            return this.bugs = (createBugs).call(this);
        },
        mousedown: function () {
            this.shield = [];
            return this.shield.push(new Shield(this.mouse.x, this.mouse.y));
        },
        update: function () {
            var i, results;
            this.ndt = max(0.001, this.dt / (1000 / 60));
            this.tick++;
            // if (this.tick % 50 === 0) {
            //     this.shield.push(new Shield(random(this.width), random(this.height)));
            // }
            i = this.shield.length;
            while (i--) {
                this.shield[i].update(this, i, this.ndt);
            }
            i = this.humans.length;
            while (i--) {
                this.humans[i].update(this, i, this.ndt);
            }
            i = this.bugs.length;
            results = [];
            while (i--) {
                var bug = this.bugs[i]
                // bug.wrap(this);
                results.push(bug.update(this, i, this.ndt));
            }
            this.bugs = this.bugs.filter(b => !b.dead);
            var infectedCount = this.humans.filter(h => h.infected).length;
            if (this.bugs.length == 0 && this.waveCount < 5 && this.humans.length > infectedCount) {
                this.bugs = createBugs.call(this);
                this.waveCount++;
            }
            if (this.waveCount == 5 || infectedCount == this.humans.length) {
                //Game Over
                this.bugs = [];
                var savedCount = this.humans.length - infectedCount;
                var personPeople = savedCount == 1 ? " person" : " people";
                this.finalMessage = this.waveCount == 5 ? ("You saved " + savedCount + personPeople + "!") : "You were overwelmed... F5 to restart";
            }
            return results;
        },
        draw: function () {
            var bug, shield, human, i, h;
            this.fillStyle = '#d33';
            i = this.shield.length;
            while (i--) {
                this.beginPath();
                shield = this.shield[i];
                if (shield.active) {
                    this.arc(shield.x, shield.y, max(0.0001, shield.radius * (shield.life / shield.radius)), 0, TWO_PI);
                } else {
                    this.arc(shield.x, shield.y, shield.growthRadius, 0, TWO_PI);
                }
                this.fill();
            }
            h = this.humans.length;
            while (h--) {
                this.beginPath();
                human = this.humans[h];
                this.arc(human.x, human.y, human.radius, 0, TWO_PI);
                if (human.infected) {
                    this.fillStyle = "#E08026";
                }
                else {
                    this.fillStyle = "#82E0AA";
                }
                this.fill();
            }
            this.beginPath();
            this.fillStyle = '#fff';
            i = this.bugs.length;
            while (i--) {
                bug = this.bugs[i];
                if (!bug.dead) {
                    this.rect(~~bug.x, ~~bug.y, 1, 1);
                }
            }
            this.fill();
            this.beginPath();
            this.arc(this.mouse.x, this.mouse.y, 10 - cos(this.millis / 100) * 2, 0, TWO_PI);
            this.strokeStyle = '#d33';
            // var text = "Shields: " +  (3 - this.shield.length) + "/ 3<br/>";
            var text = "";
            text = text + "Viruses: " + this.bugs.filter(b => !b.dead).length + "<br/>";
            text = text + "Infections: " + this.humans.filter(h => h.infected).length + " / " + this.humans.length  + "<br/>";
            text = text + "Wave #" + this.waveCount;
            document.getElementById("shieldCount").innerHTML = text;
            document.getElementById("finalMessage").innerHTML = this.finalMessage;
            return this.stroke();
        }
    });
});
// ---
// generated by coffee-script 1.9.2
