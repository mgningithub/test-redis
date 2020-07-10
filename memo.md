### Redis導入

RedisのWindows版は2016年から更新がない。
Linux版を素直に使う。
WSL使用。

#### WSLとUbuntuインストール

互換性を高めたWSL2がリリースされているが
Windows 10, version 2004のUpdateはバグリポートを機械学習しながら
影響のない端末から配信されているようで、
自分の端末はまだ対象となっていない。
手動アップデートを試みたがこのバージョンのWindows10ではサポートされていないと出てしまった。Homeなので、proでないとまだUpdateできなさそう。
一旦WSL2は断念。
https://docs.microsoft.com/ja-jp/windows/release-information/status-windows-10-2004
https://docs.microsoft.com/en-us/windows/wsl/install-win10

VSCodeにもRemote-WSLをインストール。
リモートでWSL接続しターミナルがBashになる。

Windows側からアクセス
```
\\wsl$\Ubuntu\
```
リモート側からWindowsのc:\へアクセス
```
/mnt/c/
```

rails girlsを参考に、2-1 必要なソフトウェアのインストールまで行う。
https://railsgirls.jp/install#setup_for_windows

```
sudo apt update
sudo apt upgrade -y
sudo apt install autoconf bison build-essential libssl1.0-dev libyaml-dev libreadline-dev zlib1g-dev libncurses5-dev libffi-dev libgdbm-dev sqlite3 libsqlite3-dev -y
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.2/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm alias default lts/*
nvm use default
npm install --global yarn
```
3行目のコマンドは libssl1.0-dev ないよと言われるので libssl-dev に変えて実行

#### Redisインストール

```
sudo apt install redis-server
redis-server --version
redis-server
```
起動はredis-server
終了はctrl+c

```
$ redis-cli
127.0.0.1:6379> ping
PONG
127.0.0.1:6379> set test "HELLO, World!!"
OK
127.0.0.1:6379> get test
"HELLO, World!!"
127.0.0.1:6379> keys *
127.0.0.1:6379> del test
```
https://qiita.com/wind-up-bird/items/f2d41d08e86789322c71
https://qiita.com/yoh-nak/items/69c26e7d627e2b5a95e2
https://blog.shimar.me/2016/11/18/redis-delete-data

#### nodeからRedis接続する

nodeのredisモジュールはherokuの導入例を見るとredisとioredisがあるようだがioredisの評判がよさそうなのでそちらを入れる。
https://devcenter.heroku.com/articles/heroku-redis#connecting-in-node-js
https://github.com/luin/ioredis

```
npm install ioredis --save
```

nodeでpingを打つ。

```
var Redis = require('ioredis');
var redis = new Redis(process.env.REDIS_URL);

(async () => {
    const redis = new Redis();
    const pong = await redis.ping();
    console.log(pong); // => PONG

    redis.disconnect();
})();
```

pongが返ってきた。

#### Git

gitにコミット。
こんなメッセージが。
初回はこういうの必要だったっけ。
```
*** Please tell me who you are.

Run

  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"

to set your account's default identity.
Omit --global to set the identity only in this repository.

fatal: empty ident name (for <mgn@DESKTOP.localdomain>) not allowed
```
あと.gitignoreでnode_module除外を忘れてコミットしてしまった。
```
touch .gitignore
vi .gitignore
node_modules/
rm -rf .git
git init
git add .
git commit -m 'redis ping'
git remote add origin git@github.com:mgningithub/test-redis.git
git push -u origin master
```
githubに鍵登録。
```
ssh-keygen
```
何も入力せず全てエンター。
公開鍵をgithubに登録。
```
~/.ssh/id_rsa.pub
\\wsl$\Ubuntu\home\mgn\.ssh\id_rsa.pub
```
```
git push -u origin master
```

#### nodeからRedisにレコードset

https://blog.eiel.info/blog/2014/08/26/remember-redis/

```
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
  ```