const express = require('express');

const db = require('../data/db.js');

const router = express.Router();

// GET requests
router.get('/', (req, res) => {
    db.find()
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "The posts information could not be retrieved." });
        });
});

// router.get('/:id', (req, res) => {
//     const postId = req.params.id;
//     db.findById(postId)
//         .then(post => {
//             if (post.length < 1 || post == undefined) {
//                 res.status(404).json({ error: "The post with the specified ID does not exist." });
//             } else {
//                 res.status(200).json(post);
//             }
//         })
//         .catch(err => {
//             res.status(500).json({ error: "The post information could not be retrieved." });
//         });
// });

router.get('/:id', (req, res) => {
    const postId = req.params.id;
    db.findById(postId)
        .then(([post]) => {
            console.log(post);
            if (post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ error: "The post with the specified ID does not exist." });
            }
        });
});


// router.get('/:id/comments', (req, res) => {
//     const postId = req.params.id;
//     db.findCommentById(postId)
//         .then(comments => {
//             if (comments.length < 1 || comments == undefined) {
//                 res.status(404).json({ error: "The post with the specified ID does not exist." });
//             } else {
//                 res.status(200).json(comments);
//             }
//         })
//         .catch(err => {
//             res.status(500).json({ error: "The comments information could not be retrieved." });
//         });
// });


router.get('/:post_id/comments', (req, res) => {
    const { post_id } = req.params;
    db.findById(post_id)
        .then(([post]) => {
            if (post) {
                db.findPostComments(post_id)
                    .then(comments => {
                        res.status(200).json(comments);
                    });
            } else {
                res.status(404).json({ error: "The post with the specified ID does not exist." });
            }
        })
        .catch(err => {
            console.log("get comments", err);
            res.status(500).json({ error: "The comments information could not be retrieved." });
        });
});



// POST requests
router.post(`/`, (req, res) => {
    const { title, contents } = req.body;

    if (!title || !contents) {
        return res.status(400).json({ error: "Please provide title and contents for the post." });
    }
    db.insert({ title, contents })
        .then(({ id }) => {
            db.findById(id)
                .then(([post]) => {
                    res.status(201).json(post);
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({ error: "Error getting post." });
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "There was a server error retrieving the post" });
        });
});


// router.post(`/`, (req, res) => {
//     const { title, contents } = req.body;

//     if (title && contents) {
//         db.insert({ title, contents })
//             .then(({ id }) => {
//                 db.findById(id)
//                     .then(post => {
//                         res.status(201).json(post[0]); // return HTTP status code 201 & newly created post
//                     })
//                     .catch(err => {
//                         console.log(err);
//                         res.status(500).json({ error: "There was a server error retrieving the post" });
//                     });
//             })
//             .catch(err => {
//                 console.log(err);
//                 res.status(500).json({
//                     error: "There was an error while saving the post to the database"
//                 });
//             });
//     } else {
//         res.status(400).json({ error: "Please provide title and contents for the post." });
//     }
// });

router.post('/:post_id/comments', (req, res) => {
    const { post_id } = req.params;
    const { text } = req.body;

    if (text === "" || typeof text !== "string") {
        return res.status(400).json({ error: "Comment requires text" });
    }

    db.insertComment({ text, post_id })
        .then(({ id: comment_id }) => {
            db.findCommentById(comment_id)
                .then(([comment]) => {
                    if (comment) {
                        res.status(200).json(comment);
                    } else {
                        res.status(404).json({ error: "Comment with id not found" });
                    }
                })
                .catch(err => {
                    console.log("post comment get", err);
                    res.status(500).json({ error: "Error getting comment" });
                });
        })
        .catch(err => {
            console.log("post comment", err);
            res.status(500).json({ error: "Error adding comment" });
        });
});


// router.post('/:id/comments', (req, res) => {
//     const newComment = req.body;
//     const postId = req.params.id;

//     if (!newComment.text) {
//         res.status(400).json({ error: "Please provide text for the comment." });
//     } else {
//         db.findById(postId).then(post => {
//             if (post.length < 1 || post == undefined) {
//                 res.status(404).json({ error: "The post with the specified ID does not exist." });
//             } else {
//                 db.insertComment(newComment)
//                     .then(comment => db.findCommentById(comment.id).then(commentInfo => {
//                         res.status(201).json(commentInfo);
//                     }))
//                     .catch(err => {
//                         res.status(500).json({ error: "There was an error while saving the comment to the database" });
//                     });
//             }
//         })
//     }
// });



// DELETE request
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.remove(id)
        .then(removed => {
            if (removed) {
                res.status(204).end();
            } else {
                res.status(404).json({ error: "The post with the specified ID does not exist." });
            }
        })
        .catch(err => {
            console.log("delete", err);
            res.status(500).json({ error: "The post could not be removed" });
        });
});

// router.delete('/:id', (req, res) => {
//     const postId = req.params.id;
//     db.remove(postId)
//         .then(post => {
//             if (post.length < 1 || post == undefined) {
//                 res.status(404).json({ error: "The post with the specified ID does not exist." });
//             } else {
//                 res.status(200).json({
//                     message: "The post has been deleted"
//                 })
//             }
//         })
//         .catch(err => {
//             res.status(500).json({ error: "The post could not be removed" });
//         });
// });


// PUT request
router.put('/:id', (req, res) => {
    const { title, contents } = req.body;
    const postId = req.params.id;
    if (!title || !contents) {
        return res.status(400).json({ error: "Please provide title and contents for the post." });
    }   
    db.update(id, { title, contents })
        .then(updated => {
            if (updated) {
                console.log(updated);
                db.find()
                    .then(posts => {
                        res.status(200).json(posts);
                    })
                    .catch(err => {
                        console.log(err);
                        res.status(500).json({ error: "The posts information could not be retrieved." });
                    });
            } else {
                res.status(404).json({ error: "The post with the specified ID does not exist." });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: "The post information could not be modified." });
        });   
});


// router.put('/:id', (req, res) => {
//     const editedPost = req.body;
//     const postId = req.params.id;
//     if (!editedPost.title || !editedPost.contents) {
//         return res.status(400).json({ error: "Please provide title and contents for the post." });
//     } else {
//         db.findById(postId).then(post => {
//             if (post.length < 1 || post == undefined) {
//                 res.status(404).json({ error: "The post with the specified ID does not exist." });
//             } else {
//                 db.update(postId, editedPost)
//                     .then(post => {
//                         res.status(200).json(post);
//                     })
//                     .catch(err => {
//                         res.status(500).json({ error: "The post information could not be modified." });
//                     });
//             }
//         })
//     }
// });

module.exports = router;