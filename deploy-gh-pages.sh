gulp clean
gulp dist-min

cd dist/

git init
git add -A
git commit -m 'website deployed with gulp'

git remote add github git@github.com:fossasia/open-event-webapp.git
git push github HEAD:gh-pages -f

cd ..
