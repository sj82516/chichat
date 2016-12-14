let gulp = require('gulp');
let file = [
    './dist/**/*',
    './assets/**/*'
]

gulp.task('default', function () {
    gulp.src(file, {base: './'})
        .pipe(gulp.dest('public'));
});