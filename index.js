const express = require("express"),
    app = express(),
    multer = require("multer"),
    fs = require("fs"),
    detectLang = require("lang-detector")

const authtoken = process.env.AUTHTOKEN

app.set("view engine", "pug")
app.use("/", express.static("./public"))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/img')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + "." + file.originalname.split(".").pop())
    }
})

const upload = multer({ storage })

app.post("/uploadscreenshotorvideo", (req, res, next) => {
    if (!req.header("authorization") || req.header("authorization") != authtoken) {

        return res.json({ error: "Bad auth" })
    }
    next()
}, (req, res) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            console.error(err)
            res.json({ error: err })
        }
        else {
            res.send(process.env.URL + "/" + req.file.filename)
        }
    })
})

app.get("/", (req, res) => {
    res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
})

const titles = [
    "👀 Take a look at that !",
    "📸 Check this !",
    "💫 ↓↓↓ ↓↓↓ ↓↓↓"
]

// const colors = [
//     "#e5383b",
//     "#20a4f3",
//     "#00509d",
//     "#8ac926",
//     "#6a4c93",
//     "#ff595e",
//     "#ffca3a",
//     "#192bc2",
// ]

function randomColor() {
    let color = "#"
    for (let i = 0; i < 6; i++) {
        color += (Math.floor(Math.random() * 9) + 7).toString(16)
    }
    return color
}

app.get("/:file", (req, res) => {
    const color = randomColor()
    const title = titles[Math.floor(Math.random() * titles.length)]
    if (req.params.file == "favicon.ico") return res.status(404).send()
    if (fs.existsSync("./public/img/" + req.params.file)) {
        if (req.header("user-agent").toLowerCase().includes("discord")) {
            if (["png", "jpg", "jpeg", "gif"].includes(req.params.file.split(".").pop())) {
                res.render("index", { baseurl: process.env.URL, imagename: req.params.file, title, color  })
            }
            else if (["mov", "mp4"].includes(req.params.file.split(".").pop())) {
                res.render("index-video", { baseurl: process.env.URL, imagename: req.params.file, title, color })
            }
            else if (["txt"].includes(req.params.file.split(".").pop())) {
                const txt = fs.readFileSync("./public/img/" + req.params.file, "utf-8")
                const language = detectLang(txt)
                res.render("index-text", {baseurl: process.env.URL, imagename: req.params.file, textshort: (txt.length < 4000 ? txt : txt.slice(0, 40000) + "..."), title, color, language})
            }
        }
        else {
            if (["txt"].includes(req.params.file.split(".").pop())) {
                const txt = fs.readFileSync("./public/img/" + req.params.file, "utf-8")
                const language = detectLang(txt)
                res.render("index-text-browser", {baseurl: process.env.URL, imagename: req.params.file, text: txt, textshort: (txt.length < 4000 ? txt : txt.slice(0, 40000) + "..."), title, color, language})
            }
            else {
                res.redirect("/img/" + req.params.file)
            }
        }
    }
    else {
        res.redirect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    }
})

app.listen(9050, () => {
    console.log("Listening on port 9050")
})
