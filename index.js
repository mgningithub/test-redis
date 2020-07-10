var Redis = require('ioredis');
var redis = new Redis(process.env.REDIS_URL);

(async () => {
    const redis = new Redis();
    const pong = await redis.ping();
    console.log(pong); // => PONG

    // ioredis supports all Redis commands:
    redis.set("foo", "bar"); // returns promise which resolves to string, "OK"

    // the format is: redis[SOME_REDIS_COMMAND_IN_LOWERCASE](ARGUMENTS_ARE_JOINED_INTO_COMMAND_STRING)
    // the js: ` redis.set("mykey", "Hello") ` is equivalent to the cli: ` redis> SET mykey "Hello" `

    // ioredis supports the node.js callback style
    redis.get("foo", function (err, result) {
        if (err) {
            console.error(err);
        } else {
            console.log(result); // Promise resolves to "bar"
        }
    });

    // Or ioredis returns a promise if the last argument isn't a function
    redis.get("foo").then(function (result) {
        console.log(result); // Prints "bar"
    });

    redis.del("foo");

    // Most responses are strings, or arrays of strings
    redis.zadd("sortedSet", 1, "one", 2, "dos", 4, "quatro", 3, "three");
    redis.zrange("sortedSet", 0, 2, "WITHSCORES").then((res) => console.log(res)); // Promise resolves to ["one", "1", "dos", "2", "three", "3"] as if the command was ` redis> ZRANGE sortedSet 0 2 WITHSCORES `

    // All arguments are passed directly to the redis server:
    redis.set("key", 100, "EX", 10); // set's key to value 100 and expires it after 10 seconds

    redis.flushdb();

    redis.disconnect();
})();