// ----------------------
// シークレットモードの検知1
// ----------------------
// IndexedDBを利用できるか否かで判定する
// 最終的にresolveの値がtrueならシークレットモード、falseなら通常モード
const isPrivateModeIDB = async () => {
    return new Promise((resolve) => {
        // IndexedDBが使用可能だった場合に接続オブジェクトが自動的に入る。
        // それらには.close()などのメソッドがあり、利用するために変数をここで宣言している。
        let db;
        try {
            // IndexedDBに接続を試みる
            let request = indexedDB.open("test");
            request.onerror = () => {
                resolve(true); // シークレットモードであると判断
            };
            request.onsuccess = () => {
                // 接続オブジェクトを格納
                db = request.result;
                db.close();
                resolve(false); // シークレットモードではないと判断
            };
        } catch (e) {
            resolve(true); // シークレットモードであると判断
        }
    });
};

// ----------------------
// シークレットモードの検知2
// ----------------------
// ファイルシステムAPIを利用できるか否かで判定する
// 最終的にresolveの値がtrueならシークレットモード、falseなら通常モード
const isPrivateModeFS = async () => {
    return new Promise((resolve) => {
        // ファイルシステムAPIが使用可能だった場合に接続オブジェクトが自動的に入る。
        const fs = window.RequestFileSystem || window.webkitRequestFileSystem;

        if (!fs) {
            resolve(null); // ファイルシステムAPIがサポートされていない場合
            return;
        }
        fs(
            window.TEMPORARY,
            100,
            () => {
                resolve(false); // シークレットモードではないと判断
            },
            () => {
                resolve(true); // シークレットモードであると判断
            }
        );
        // 上記の記述はfileSystem の引数構成を利用して、成功時は第３引数、失敗時は第４引数のコールバックが呼ばれる仕組み。
    });
};

// ----------------------
// ランダムトークンの生成
// ----------------------
const createDeviceToken = () => {
    // localStorageから既存のトークンを取得しようとしている
    let token = localStorage.getItem("device_token");

    // トークンが存在しない場合、新たに生成してlocalStorageに保存する
    if (!token) {
        // 便利なメソッド、クリプト・ランダムUUIDを利用してトークンを生成
        // UUIDの形式: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
        token = crypto.randomUUID();
        localStorage.setItem("device_token", token);
        console.log("新しいデバイストークンが生成されました:", token);
    } else {
        console.log("既存のデバイストークンが見つかりました:", token);
    }

    return token;
};

// ----------------------
// ページ読み込み時の処理
// ----------------------
window.addEventListener("DOMContentLoaded", async () => {
    // シークレットモードの検知
    const isPrivateIDB = await isPrivateModeIDB();
    const isPrivateFS = await isPrivateModeFS();

    // どちらかの方法でシークレットモードと判定された場合
    const isPrivate = isPrivateIDB || isPrivateFS;

    if (isPrivate) {
        alert(
            "シークレットモードでは投票ができません。\n通常モードで再度アクセスしてください。"
        );
        document.body.innerHTML =
            "<h2 style='text-align:center;color:red;margin-top:100px;'>通常モードでアクセスしてください。</h2>";
        return;
    }

    // デバイストークンの生成
    createDeviceToken();

    // ----------------------
    // 投票ページに遷移する処理をここに記述
    // -----------------------
    document.getElementById("startVoteButton").addEventListener("click", () => {
        console.log("投票ページに遷移されました。");
        window.location.href = "vote.html";
    });
});
